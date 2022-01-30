const format = require('date-fns/format');
const keyboard = require('./keyboards/keyboard');
const {
  driversWithoutChatIdToInlineKeyboard,
  carsToInlineKeyboard,
  driversToInlineKeyboard,
  yearsToInlineKeyboard,
  monthsesToInlineKeyboard,
  candidateAddReject
} = require('./keyboards/inline');
const config = require('./config');

module.exports = {
  accessDenied: (sendMessage, chatId) => {
    const message = `Адміністративний розділ.\n<b>У доступі відмовлено.</b>\nДля початку роботи натисніть /start`;
    const options = {
      parse_mode: 'HTML'
    };
    return sendMessage(chatId, message, options);
  },
  mainAdminKeyboard: (sendMessage, chatId, driverStatus) => {
    const message = `Оберіть опцію`;
    const options = {
      reply_markup: keyboard.admin(driverStatus)
    };
    return sendMessage(chatId, message, options);
  },
  messageForNewVisitor: (sendMessage, candidate) => {
    const message = [
      `Доброго дня ${candidate.first_name}`,
      `Я Вас поки не знаю.`,
      `<b>Уточнюю чи можу Вам надати доступ...</b>`
    ].join('\n');
    const options = {
      parse_mode: 'HTML'
    };
    return sendMessage(candidate.tlg_chatId, message, options);
  },
  reportForCreatorAboutNewUser: (sendMessage, candidate, action) => {
    const message = [
      `У нас відвідувач =)`,
      `Ім'я: <b>${candidate.first_name}</b>`,
      `Ім'я користувача: <b>${candidate.name}</b>`,
      `Ідентифікатор чату: <b>${candidate.tlg_chatId}</b>`
    ].join('\n');
    const options = {
      parse_mode: 'HTML'
    };
    return sendMessage(config.CREATOR_CHAT_ID, message, options).then(() => {
      sendMessage(config.CREATOR_CHAT_ID, `Добавить?`, {
        reply_markup: {
          inline_keyboard: candidateAddReject(candidate.tlg_chatId, action)
        }
      });
    });
  },
  addOrNotNewUserToDb: (
    sendMessage,
    chatId,
    candidateChatId,
    driversWithoutChatId,
    action
  ) => {
    const message = `Додати водія в базу?`;
    const options = {
      reply_markup: {
        inline_keyboard: driversWithoutChatIdToInlineKeyboard(
          driversWithoutChatId,
          candidateChatId,
          action
        )
      }
    };
    return sendMessage(chatId, message, options);
  },
  getListOfYearsInline: (sendMessage, chatId, years, carForStat, action) => {
    const { model, number } = carForStat;
    const message = `${model} - ${number} \n Оберіть рік`;
    const options = {
      reply_markup: {
        inline_keyboard: yearsToInlineKeyboard(years, action)
      }
    };
    return sendMessage(chatId, message, options);
  },
  getListOfMonthesInline: (
    sendMessage,
    chatId,
    monthses,
    year,
    carForStat,
    action
  ) => {
    const { model, number } = carForStat;
    const message = `${model} - ${number} \n Оберіть місяць`;
    const options = {
      reply_markup: {
        inline_keyboard: monthsesToInlineKeyboard(monthses, year, action)
      }
    };
    return sendMessage(chatId, message, options);
  },
  newUserRejected: (sendMessage, chatId) => {
    const message = `<b>У доступі відмовлено.</b>`;
    const options = { parse_mode: 'HTML' };
    return sendMessage(chatId, message, options);
  },
  carsAssignedToDriver: (sendMessage, chatId, { name, carsIds }) => {
    const driverStat = [
      `<b>${name}</b>`,
      carsIds.length
        ? `Кількість закріплених за вами авто: <b>${carsIds.length}</b>.\n`
        : null,
      carsIds.length ? `Список закріплених авто:\n` : null
    ].join('\n');

    const listOfCars = carsIds.length
      ? carsIds
          .map(({ model, number }) => {
            return [`<pre>${number}</pre> - ${model}`];
          })
          .join('\n')
      : 'За вами жодне авто не закріплено';

    const message = driverStat + listOfCars;
    const options = {
      parse_mode: 'HTML'
    };
    return sendMessage(chatId, message, options);
  },
  giveOutGasoline: (sendMessage, chatId, cars, action) => {
    const message = [
      `<b>1.</b> Обрати авто зі списку;`,
      `<b>2.</b> Вказати скільки літрів видано на авто`
    ].join('\n');
    const options = {
      parse_mode: 'HTML'
    };

    return sendMessage(chatId, message, options).then(() => {
      sendMessage(chatId, `На яке авто видати пальне?`, {
        reply_markup: {
          inline_keyboard: carsToInlineKeyboard(cars, action)
        }
      });
    });
  },
  autoIsSelectedForGiveOutGasoline: (sendMessage, chatId, car) => {
    const message = [
      `Ви обрали:`,
      `Авто: <b>[ ${car.model} ]</b>`,
      `д.н.з.: <b>[ ${car.number} ]</b>`,
      `Залишок талонами: <b>${car.gasoline_residue}</b> літрів`,
      `\nСкільки літрів видати? (введіть ціле число)`
    ].join('\n');
    const options = {
      parse_mode: 'HTML'
    };
    return sendMessage(chatId, message, options);
  },
  totalFuelBalance: (sendMessage, chatId, cars) => {
    const message = cars
      .map(({ model, number, gasoline_residue }) => {
        return [
          `<b>${model}</b>`,
          `<b>${number}</b>`,
          `Залишилось: <b>${gasoline_residue}</b> літрів`
        ].join('\n');
      })
      .join('\n\n');
    const options = {
      parse_mode: 'HTML'
    };
    return sendMessage(chatId, message, options);
  },
  inlineKbdListOfCars: (sendMessage, chatId, cars, action) => {
    const message = `Оберіть авто`;
    const options = {
      reply_markup: {
        inline_keyboard: carsToInlineKeyboard(cars, action)
      }
    };
    return sendMessage(chatId, message, options);
  },
  inlineKbdListOfDrivers: (sendMessage, chatId, drivers, action) => {
    const message = `Оберіть водія`;
    const options = {
      reply_markup: {
        inline_keyboard: driversToInlineKeyboard(drivers, action)
      }
    };
    return sendMessage(chatId, message, options);
  },
  offerToPressStart: (sendMessage, chatId) => {
    return sendMessage(chatId, `Для початку тисніть -> \/start`, {
      parse_mode: 'HTML'
    });
  },
  dontUnderstand: (sendMessage, chatId) => {
    return sendMessage(
      chatId,
      `Нажаль я вас не розумію. Виконуйте дії послідовно.`,
      {
        parse_mode: 'HTML'
      }
    );
  },
  startDialog: (sendMessage, chatId, cars, action) => {
    const message = [
      `<b>1.</b> Обрати авто зі списку;`,
      `<b>2.</b> Вказати на скільки літрів заправляємо;`,
      `<b>3.</b> Додати фото чека.`
    ].join('\n');
    const options = {
      parse_mode: 'HTML'
    };
    return sendMessage(chatId, message, options)
      .then(() => {
        sendMessage(chatId, `Яке авто заправляємо?`, {
          reply_markup: {
            inline_keyboard: carsToInlineKeyboard(cars, action)
          }
        });
      })
      .then(() => {
        sendMessage(chatId, `Чи інші функції ?`, {
          reply_markup: keyboard.myCars()
        });
      });
  },
  helpMessage: (sendMessage, chatId) => {
    const message = [
      `<b>1.</b> Обрати авто зі списку;`,
      `<b>2.</b> Вказати на скільки літрів заправляємо;`,
      `<b>3.</b> Додати фото чека.`
    ].join('\n');
    const options = {
      parse_mode: 'HTML'
    };
    return sendMessage(chatId, message, options);
  },
  howMuchDoWeFill: (sendMessage, chatId, car, status) => {
    const { model, number, gasoline_residue } = car;
    const message = [
      `Ви обрали:`,
      `Авто: <b>[ ${model} ]</b>`,
      `д.н.з.: <b>[ ${number} ]</b>`
    ];
    if (status < 2) {
      message.push(`Маєте талонами: <b>${gasoline_residue}</b> літрів`);
    }
    message.push(`\nНа скільки літрів заправляємо?\n(введіть ціле число)`);
    const options = {
      parse_mode: 'HTML'
    };
    return sendMessage(chatId, message.join('\n'), options);
  },
  refuelReportAndAskForCheck: (
    sendMessage,
    chatId,
    car,
    resLitres,
    litres,
    status
  ) => {
    const message = [
      `Ви заправили:`,
      `Авто: <b>[ ${car.model} ]</b>`,
      `д.н.з.: <b>[ ${car.number} ]</b>`,
      `Заправлено на: <b>${litres}</b> літрів`
    ];
    if (status < 2) {
      message.push(`Залишиться талонами: <b>${resLitres}</b> літрів`);
    }
    message.push('\nЗбережено &#x1F4BE\n');
    message.push('&#x203C <b>Додайте якісне фото чека</b> &#x1F4F7');

    const options = {
      parse_mode: 'HTML'
    };

    return sendMessage(chatId, message.join('\n'), options);
  },
  giveOutReport: (sendMessage, chatId, car, resLitres, litres, status) => {
    const message = [
      `Паливо видано на авто:`,
      `Авто: <b>[ ${car.model} ]</b>`,
      `д.н.з.: <b>[ ${car.number} ]</b>`,
      `Видано: <b>${litres}</b> літрів`
    ];
    if (status < 2) {
      message.push(`Залишилось талонами: <b>${resLitres}</b> літрів`);
    }
    const options = {
      parse_mode: 'HTML'
    };
    return sendMessage(chatId, message.join('\n'), options);
  },
  reportDriverChatIdIsAddedToDb: (
    sendMessage,
    creatorChatId,
    candidateChatId,
    driverName
  ) => {
    const messageToCreator = [
      `Водію присвоєно ідентифікатор.`,
      `Водій: ${driverName}`,
      `Ідентифікатор водія: ${candidateChatId}`
    ].join('\n');
    return sendMessage(creatorChatId, messageToCreator, {
      parse_mode: 'HTML'
    }).then(() => {
      sendMessage(
        candidateChatId,
        `${driverName}, вітаємо. Вас додано до бази.`,
        {
          parse_mode: 'HTML'
        }
      ).then(() => {
        sendMessage(candidateChatId, `\/start`, {
          parse_mode: 'HTML'
        });
      });
    });
  },
  failedToAddChatIdToDb: (sendMessage, creatorChatId, candidateChatId) => {
    const m1 = `НЕ вдалося додати водія до бази`;
    const m2 = `Вас НЕ вдалося додати до бази. Спробуйте пізніше`;
    const options = { parse_mode: 'HTML' };
    return sendMessage(creatorChatId, m1, options).then(() => {
      sendMessage(candidateChatId, m2, options);
    });
  },
  fullInfoAboutCar: (sendMessage, chatId, car, status) => {
    const aboutCar = [`<b>${car.model}</b>`, `<b>${car.number}</b>`];
    if (status < 3) {
      aboutCar.push(`Залишилось: <b>${car.gasoline_residue}</b> літрів`);
    }
    aboutCar.push(
      `Кількість закріплених за авто: <b>${car.driversIds.length}</b> чол.\nА саме:\n`
    );
    const listDrivers = car.driversIds
      .map(({ name }) => {
        const [sName, nName, fName] = name.split(' ');
        return [`<b>${sName}</b> ${nName} ${fName}`];
      })
      .join('\n');
    const message = aboutCar.join('\n') + listDrivers;
    const options = {
      parse_mode: 'HTML'
    };
    return sendMessage(chatId, message, options);
  },
  fullInfoAboutDriver: (sendMessage, chatId, driver) => {
    const driverNameStat = [
      `Обраний водій:`,
      `<b>${driver.name}</b>`,
      driver.carsIds.length
        ? `Кількість закріплених авто: <b>${driver.carsIds.length}</b>.\n`
        : null,
      driver.carsIds.length ? `Список закріплених авто:\n` : null
    ].join('\n');
    const listOfCars = driver.carsIds.length
      ? driver.carsIds
          .map(({ model, number }) => {
            return [`<pre>${number}</pre> - ${model}`];
          })
          .join('\n')
      : 'За обраним водієм жодне авто не закріплено';
    const message = driverNameStat + listOfCars;
    const options = {
      parse_mode: 'HTML'
    };
    return sendMessage(chatId, message, options);
  },
  refuelStatForCarInSpecMonth: (sendMessage, chatId, monthTotalStat) => {
    const { car, monthLabel, data } = monthTotalStat;
    const headerStat = [
      `Статистика за <b>${monthLabel}</b> для:\n`,
      `<b>${car.model}</b>\n<pre>${car.number}</pre>\n`
    ].join('\n');

    const dataStat = data
      .map(currDate => {
        date = format(currDate.date, 'dd.MM.yyyy');
        let message = `\n<b>${date} заправлено на ${currDate.litres}\n</b>`;
        message += currDate.imgsAndDrivers
          .map(({ img, litres }, index) => {
            return `<i><a href="${img}">Чек № ${(index += 1)} на ${litres} л.</a></i>`;
          })
          .join('\n');
        return message;
      })
      .join('\n');

    const message = headerStat + dataStat;
    const options = {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    };
    return sendMessage(chatId, message, options);
  }
};
