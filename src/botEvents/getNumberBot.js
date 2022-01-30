const botMessages = require('../botMessages');
const {
  getCarByIdWithoutDriversIds,
  setCarGasolineResidue
} = require('../db/car-db-queries');
const {
  getTempCarId,
  setTempLitres,
  getDriverStatusByChatId,
  getGiveOutOrRefuel,
  resetTempDataInDriver
} = require('../db/driver-db-queries');

const getNumber = bot => {
  // любое число от 0-999 (сюда я ловлю литры)
  bot.getNumberOfLiters(async msg => {
    // Refactored
    const chatId = msg.chat.id;
    try {
      const carId = await getTempCarId(chatId);
      if (!carId.temp_carId) {
        botMessages.offerToPressStart(bot.sendMessage.bind(bot), chatId);
      } else {
        const car = await getCarByIdWithoutDriversIds(carId.temp_carId);
        const giveOutOrRefuel = await getGiveOutOrRefuel(chatId);
        const litres = parseInt(msg.text.trim());
        let resLitres = 0;
        if (giveOutOrRefuel) {
          // give out talon
          resLitres = car.gasoline_residue + litres;
          await setCarGasolineResidue(car._id, resLitres).then(() => {
            resetTempDataInDriver(carId._id);
          });
        } else {
          // refuel
          resLitres = car.gasoline_residue - litres;
          // setCarGasolineResidue - in bot.photo !!!
        }
        await setTempLitres(chatId, litres);
        const driverStatus = await getDriverStatusByChatId(chatId);
        litresReport(
          bot,
          chatId,
          car,
          resLitres,
          litres,
          driverStatus.status,
          giveOutOrRefuel
        );
      }
    } catch (error) {
      console.log(error);
    }
  });
};

const litresReport = async (
  bot,
  chatId,
  car,
  resLitres,
  litres,
  status,
  giveOutOrRefuel
) => {
  if (giveOutOrRefuel) {
    botMessages.giveOutReport(
      bot.sendMessage.bind(bot),
      chatId,
      car,
      resLitres,
      litres,
      status
    );
  } else {
    botMessages.refuelReportAndAskForCheck(
      bot.sendMessage.bind(bot),
      chatId,
      car,
      resLitres,
      litres,
      status
    );
  }
};

module.exports = getNumber;
