const botMessages = require('../botMessages');

const {
  getAllCarsModelNumber,
  getAllCarsModelNumberGas
} = require('../db/car-db-queries');

const {
  getDriverStatusByChatId,
  getAllDriversByAlphabet,
  getDriverIdByChatId,
  getDriverByIdWithCars,
  setGiveOutOrRefuel
} = require('../db/driver-db-queries');

const KB_BTNS = require('../keyboards/buttons');
const ACTION = require('../keyboards/inline-actions');

const message = bot => {
  bot.message(async msg => {
    const chatId = msg.chat.id;
    const { status } = await getDriverStatusByChatId(msg.chat.id);
    switch (msg.text) {
      case KB_BTNS.GIVE_OUT_FUEL:
        status === 0
          ? giveOutFuel(bot.sendMessage.bind(bot), chatId)
          : botMessages.accessDenied(bot.sendMessage.bind(bot), chatId); // Done
        break;
      case KB_BTNS.TOTAL_FUEL_BALANCE:
        status < 2
          ? totalFuelBalance(bot.sendMessage.bind(bot), chatId)
          : botMessages.accessDenied(bot.sendMessage.bind(bot), chatId); // Done
        break;
      case KB_BTNS.ABOUT_CAR: // Done
        status < 3
          ? aboutCar(bot.sendMessage.bind(bot), chatId)
          : botMessages.accessDenied(bot.sendMessage.bind(bot), chatId); // Done
        break;
      case KB_BTNS.CAR_REFUEL_STAT: // Done
        status < 2
          ? carStatistic(bot.sendMessage.bind(bot), chatId)
          : botMessages.accessDenied(bot.sendMessage.bind(bot), chatId);
        break;
      case KB_BTNS.ABOUT_DRIVER: // Done
        status < 3
          ? aboutDriver(bot.sendMessage.bind(bot), chatId)
          : botMessages.accessDenied(bot.sendMessage.bind(bot), chatId);
        break;
      case KB_BTNS.MY_CARS: // Done
        myCars(bot.sendMessage.bind(bot), chatId);
        break;
      default:
        if (msg.text) {
          const keysCount = Object.keys(bot.allowableEmmitersNames).length;
          let nullCount = 0;
          for (const key in bot.allowableEmmitersNames) {
            if (
              !Array.isArray(msg.text.match(bot.allowableEmmitersNames[key]))
            ) {
              nullCount += 1;
            }
          }
          if (keysCount === nullCount) {
            botMessages
              .dontUnderstand(bot.sendMessage.bind(bot), chatId)
              .then(() => {
                botMessages.helpMessage(bot.sendMessage.bind(bot), chatId);
              })
              .then(() => {
                botMessages.offerToPressStart(
                  bot.sendMessage.bind(bot),
                  chatId
                );
              });
          }
        }
        break;
    }
  });
};

const giveOutFuel = async (sendMessage, chatId) => {
  const cars = await getAllCarsModelNumber();
  await setGiveOutOrRefuel(chatId, true);
  botMessages.giveOutGasoline(sendMessage, chatId, cars, ACTION.GIVE_OUT_FUEL);
};

const totalFuelBalance = async (sendMessage, chatId) => {
  const cars = await getAllCarsModelNumberGas();
  botMessages.totalFuelBalance(sendMessage, chatId, cars);
};

const aboutCar = async (sendMessage, chatId) => {
  const cars = await getAllCarsModelNumber();
  botMessages.inlineKbdListOfCars(
    sendMessage,
    chatId,
    cars,
    ACTION.INFO_ABOUT_CAR
  );
};

const carStatistic = async (sendMessage, chatId) => {
  const cars = await getAllCarsModelNumber();
  botMessages.inlineKbdListOfCars(
    sendMessage,
    chatId,
    cars,
    ACTION.CAR_STATISTIC
  );
};

const aboutDriver = async (sendMessage, chatId) => {
  const drivers = await getAllDriversByAlphabet();
  botMessages.inlineKbdListOfDrivers(
    sendMessage,
    chatId,
    drivers,
    ACTION.INFO_ABOUT_DRIVER
  );
};

const myCars = async (sendMessage, chatId) => {
  const driver = await getDriverIdByChatId(chatId);
  if (!driver) {
    botMessages.accessDenied(sendMessage, chatId);
  } else {
    const drv = await getDriverByIdWithCars(driver._id);
    botMessages.carsAssignedToDriver(sendMessage, chatId, drv);
  }
};

module.exports = message;
