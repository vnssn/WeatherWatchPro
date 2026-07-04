export class WeatherData {
  constructor(id, deviceId, temperatureDHT, temperatureBMP, humidity, pressure, timestamp, signalStrength, uptime) {
    this.id = id;
    this.deviceId = deviceId;
    this.temperatureDHT = temperatureDHT;
    this.temperatureBMP = temperatureBMP;
    this.humidity = humidity;
    this.pressure = pressure;
    this.timestamp = timestamp;
    this.signalStrength = signalStrength;
    this.uptime = uptime;
  }
}

export class Device {
  constructor(id, deviceId, name, lastSeen) {
    this.id = id;
    this.deviceId = deviceId;
    this.name = name;
    this.lastSeen = lastSeen;
  }
}

export class ComfortLevel {
  constructor(level, description) {
    this.level = level;
    this.description = description;
  }
}

export class WeatherStatus {
  constructor(status, description) {
    this.status = status;
    this.description = description;
  }
}

export class PressureTrend {
  constructor(trend, description) {
    this.trend = trend;
    this.description = description;
  }
}

export class WeatherIndication {
  constructor(indication, description) {
    this.indication = indication;
    this.description = description;
  }
}

export class WeatherInterpretation {
  constructor(comfort, humidityStatus, pressureTrend, weatherIndication) {
    this.comfort = comfort;
    this.humidityStatus = humidityStatus;
    this.pressureTrend = pressureTrend;
    this.weatherIndication = weatherIndication;
  }
}

export class GaugeData {
  constructor(value, min, max, suffix) {
    this.value = value;
    this.min = min;
    this.max = max;
    this.suffix = suffix;
  }
}

export class ChartDataPoint {
  constructor(time, value) {
    this.time = time;
    this.value = value;
  }
}

export class HistoricalData {
  constructor(temperatureDHT, temperatureBMP, humidity, pressure) {
    this.temperatureDHT = temperatureDHT;
    this.temperatureBMP = temperatureBMP;
    this.humidity = humidity;
    this.pressure = pressure;
  }
}
