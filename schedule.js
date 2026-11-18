(function (root) {
  var EVENT = { year: 2027, month: 1, day: 21 };
  var BLOCKS = [
    { id: "duty", start: 7 * 60 + 40, end: 8 * 60, label: "早上值崗" },
    { id: "homeroom", start: 8 * 60, end: 8 * 60 + 15, label: "班主任課" },
    { id: "task1", start: 8 * 60 + 15, end: 9 * 60, label: "任務（一）探究防寒服的材料與結構" },
    { id: "task2", start: 9 * 60, end: 9 * 60 + 45, label: "任務（二）探究防風材料" },
    { id: "recess1", start: 9 * 60 + 45, end: 10 * 60, label: "小息（一）" },
    { id: "extension", start: 10 * 60, end: 10 * 60 + 45, label: "拓展學習：探究防水性能" },
    { id: "task3", start: 10 * 60 + 45, end: 11 * 60 + 30, label: "任務（三）探究保溫填充材料" },
    { id: "recess2", start: 11 * 60 + 30, end: 11 * 60 + 45, label: "小息（二）" },
    { id: "task3b", start: 11 * 60 + 45, end: 12 * 60 + 15, label: "任務（三）續　繪圖並論證保溫結果" },
    { id: "task4", start: 12 * 60 + 15, end: 12 * 60 + 45, label: "任務（四）防寒服大比拼" },
    { id: "wrap", start: 12 * 60 + 45, end: 13 * 60 + 25, label: "匯報、整理與頒獎" },
    { id: "dismiss", start: 13 * 60 + 25, end: 24 * 60, label: "放學" }
  ];

  function hkParts(date) {
    var fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Hong_Kong",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    });
    var map = {};
    fmt.formatToParts(date).forEach(function (part) {
      map[part.type] = part.value;
    });
    var hour = Number(map.hour);
    if (hour === 24) hour = 0;
    return {
      year: Number(map.year),
      month: Number(map.month),
      day: Number(map.day),
      hour: hour,
      minute: Number(map.minute),
      minutes: hour * 60 + Number(map.minute)
    };
  }

  function isEventDay(parts) {
    return parts.year === EVENT.year && parts.month === EVENT.month && parts.day === EVENT.day;
  }

  function blockAt(minutes) {
    for (var i = 0; i < BLOCKS.length; i += 1) {
      if (minutes >= BLOCKS[i].start && minutes < BLOCKS[i].end) return BLOCKS[i];
    }
    return null;
  }

  function resolve(date) {
    var parts = hkParts(date);
    var eventDay = isEventDay(parts);
    return {
      parts: parts,
      eventDay: eventDay,
      block: eventDay ? blockAt(parts.minutes) : null
    };
  }

  function clock(parts) {
    var hh = String(parts.hour).padStart(2, "0");
    var mm = String(parts.minute).padStart(2, "0");
    return hh + ":" + mm;
  }

  root.SteamDay = {
    EVENT: EVENT,
    BLOCKS: BLOCKS,
    hkParts: hkParts,
    isEventDay: isEventDay,
    blockAt: blockAt,
    resolve: resolve,
    clock: clock
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
