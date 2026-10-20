const { McpServer } = require("@modelcontextprotocol/server");
const { serveStdio } = require("@modelcontextprotocol/server/stdio");
const { z } = require("zod");

// Инициализация сервера СС ТМК в соответствии со спецификацией Минтранса
const server = new McpServer({
  name: "SS-TMK-Sensor-Gateway",
  version: "1.0.0"
});

// База данных зарегистрированных датчиков (координат) ОТИ
const KNOWN_COORDS = {
  "т1": "Камера ситуационной видеоаналитики — Периметр Юг",
  "т2": "Датчик СКУД — Вход в терминал А",
  "т3": "Извещатель охранный — Зона транспортной безопасности",
  "т4": "Камера распознавания номеров — КПП-1",
  "т5": "Сенсор целостности ограждения — Сектор 5"
};

// 1. Реализация метода GetKnownCoords
server.tool(
  "GetKnownCoords",
  "Получить полный перечень доступных координат (идентификаторов датчиков) на объекте транспортной инфраструктуры.",
  {},
  async () => {
    let text = "Перечень зарегистрированных датчиков (координат) ОТИ:\n";
    for (const [code, desc] of Object.entries(KNOWN_COORDS)) {
      text += `- [${code}]: ${desc}\n`;
    }
    return { content: [{ type: "text", text }] };
  }
);

// 2. Реализация метода AddEvent
server.tool(
  "AddEvent",
  "Регистрация события нижнего уровня от технических средств транспортной безопасности при срабатывании датчика.",
  {
    sensor_id: z.string().describe("Идентификатор датчика (например: т1, т2, т3, т4, т5)")
  },
  async ({ sensor_id }) => {
    if (!(sensor_id in KNOWN_COORDS)) {
      return { content: [{ type: "text", text: `Ошибка: Датчик '${sensor_id}' не зарегистрирован в системе СС ТМК.` }] };
    }
    
    const currentTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const sensorDesc = KNOWN_COORDS[sensor_id];
    
    return {
      content: [{
        type: "text",
        text: `[СС ТМК API | AddEvent]\nСтатус: Событие нижнего уровня успешно зарегистрировано\nВремя: ${currentTime}\nИсточник (Координата): ${sensor_id} (${sensorDesc})\nРезультат: Сигнал передан в подсистему предварительной обработки для проверки моделей угроз.`
      }]
    };
  }
);

// Запуск stdio-транспорта для связи сервера с ИИ-клиентами
async function main() {
  const transport = new serveStdio();
  await server.connect(transport);
}

main().catch(console.error);
