const { Server } = require("@modelcontextprotocol/server");
const { serveStdio } = require("@modelcontextprotocol/server/stdio");

// Создаем инстанс сервера СС ТМК Минтранса через базовый класс Server
const server = new Server(
  {
    name: "SS-TMK-Sensor-Gateway",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// База данных зарегистрированных датчиков (координат) ОТИ
const KNOWN_COORDS = {
  "т1": "Камера ситуационной видеоаналитики — Периметр Юг",
  "т2": "Датчик СКУД — Вход в терминал А",
  "т3": "Извещатель охранный — Зона транспортной безопасности",
  "т4": "Камера распознавания номеров — КПП-1",
  "т5": "Сенсор целостности ограждения — Сектор 5"
};

// Обработчик запроса списка инструментов (Call для tools/list)
server.setRequestHandler(
  "tools/list",
  async () => {
    return {
      tools: [
        {
          name: "GetKnownCoords",
          description: "Получить полный перечень доступных координат (идентификаторов датчиков) на объекте транспортной инфраструктуры.",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "AddEvent",
          description: "Регистрация события нижнего уровня от технических средств транспортной безопасности при срабатывании датчика.",
          inputSchema: {
            type: "object",
            properties: {
              sensor_id: {
                type: "string",
                description: "Идентификатор датчика (например: т1, т2, т3, т4, т5)",
              },
            },
            required: ["sensor_id"],
          },
        },
      ],
    };
  }
);

// Обработчик вызова конкретного инструмента (Call для tools/call)
server.setRequestHandler(
  "tools/call",
  async (request) => {
    const { name, arguments: args } = request.params;

    if (name === "GetKnownCoords") {
      let text = "Перечень зарегистрированных датчиков (координат) ОТИ:\n";
      for (const [code, desc] of Object.entries(KNOWN_COORDS)) {
        text += `- [${code}]: ${desc}\n`;
      }
      return { content: [{ type: "text", text }] };
    }

    if (name === "AddEvent") {
      const sensor_id = args ? args.sensor_id : null;
      if (!sensor_id || !(sensor_id in KNOWN_COORDS)) {
        return { content: [{ type: "text", text: `Ошибка: Датчик '${sensor_id || ""}' не зарегистрирован в системе СС ТМК.` }] };
      }

      const currentTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const sensorDesc = KNOWN_COORDS[sensor_id];

      return {
        content: [{
          type: "text",
          text: `[СС ТМК API | AddEvent]\nСтатус: Событие нижнего уровня успешно зарегистрировано\nВремя: ${currentTime}\nИсточник (Координата): ${sensor_id} (${sensorDesc})\nРезультат: Сигнал передан в подсистему предварительной обработки для проверки моделей угроз.`,
        }],
      };
    }

    throw new Error(`Инструмент ${name} не найден`);
  }
);

// Запуск транспорта через стандартный ввод/вывод (STDIO)
async function main() {
  const transport = new serveStdio();
  await server.connect(transport);
}

main().catch(console.error);
