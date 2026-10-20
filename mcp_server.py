import sys
import json
import datetime

KNOWN_COORDS = {
    "т1": "Камера ситуационной видеоаналитики — Периметр Юг",
    "т2": "Датчик СКУД — Вход в терминал А",
    "т3": "Извещатель охранный — Зона транспортной безопасности",
    "т4": "Камера распознавания номеров — КПП-1",
    "т5": "Сенсор целостности ограждения — Сектор 5"
}

def send_response(req_id, result):
    response = {"jsonrpc": "2.0", "id": req_id, "result": result}
    sys.stdout.write(json.dumps(response, ensure_ascii=False) + "\n")
    sys.stdout.flush()

def send_error(req_id, code, message):
    response = {"jsonrpc": "2.0", "id": req_id, "error": {"code": code, "message": message}}
    sys.stdout.write(json.dumps(response, ensure_ascii=False) + "\n")
    sys.stdout.flush()

def main():
    for line in sys.stdin:
        if not line.strip():
            continue
        try:
            request = json.loads(line)
            req_id = request.get("id")
            method = request.get("method")
            params = request.get("params", {})

            if method == "initialize":
                send_response(req_id, {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {"tools": {}},
                    "serverInfo": {"name": "SS-TMK-Sensor-Gateway", "version": "1.0.0"}
                })
            elif method == "tools/list":
                send_response(req_id, {
                    "tools": [
                        {
                            "name": "GetKnownCoords",
                            "description": "Получить полный перечень доступных координат (идентификаторов датчиков) на объекте транспортной инфраструктуры.",
                            "inputSchema": {"type": "object", "properties": {}}
                        },
                        {
                            "name": "AddEvent",
                            "description": "Регистрация события нижнего уровня от технических средств транспортной безопасности при срабатывании датчика.",
                            "inputSchema": {
                                "type": "object",
                                "properties": {
                                    "sensor_id": {"type": "string", "description": "Идентификатор датчика (например: т1, т2)"}
                                },
                                "required": ["sensor_id"]
                            }
                        }
                    ]
                })
            elif method == "tools/call":
                tool_name = params.get("name")
                tool_args = params.get("arguments", {})

                if tool_name == "GetKnownCoords":
                    text = "Перечень зарегистрированных датчиков (координат) ОТИ:\n"
                    for code, desc in KNOWN_COORDS.items():
                        text += f"- [{code}]: {desc}\n"
                    send_response(req_id, {"content": [{"type": "text", "text": text}]})

                elif tool_name == "AddEvent":
                    sensor_id = tool_args.get("sensor_id")
                    if not sensor_id or sensor_id not in KNOWN_COORDS:
                        send_response(req_id, {"content": [{"type": "text", "text": f"Ошибка: Датчик '{sensor_id}' не зарегистрирован."}]})
                        continue

                    current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    sensor_desc = KNOWN_COORDS[sensor_id]
                    
                    text = (
                        f"[СС ТМК API | AddEvent]\n"
                        f"Статус: Событие нижнего уровня успешно зарегистрировано\n"
                        f"Время: {current_time}\n"
                        f"Источник (Координата): {sensor_id} ({sensor_desc})\n"
                        f"Результат: Сигнал передан в подсистему предварительной обработки для проверки моделей угроз."
                    )
                    send_response(req_id, {"content": [{"type": "text", "text": text}]})
                else:
                    send_error(req_id, -32601, f"Инструмент {tool_name} не найден")
            elif req_id is not None:
                send_error(req_id, -32601, "Метод не поддерживается")
        except Exception as e:
            sys.stderr.write(f"Error parsing line: {e}\n")
            sys.stderr.flush()

if __name__ == "__main__":
    main()
