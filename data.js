/* 日程台 · 唯一数据源（改这一份，六个视图一起变） */
window.DATA = {

  term: { name: "2026 秋", week1: "2026-08-31", weeks: 17, holiday: [] },

  /* ── 课程：按周重复 ── */
  courses: [
    { id:"c01", name:"工科高等代数", place:"主 M201", weekday:1, start:"08:00", end:"09:35", weeks:[1,17] },
    { id:"c02", name:"体育（武术）", place:"健美操厅", weekday:1, start:"09:55", end:"11:30", weeks:[1,17] },
    { id:"c03", name:"英语口语", place:"F219", weekday:1, start:"14:00", end:"15:35", weeks:[2,9] },
    { id:"c04", name:"英语阅读", place:"F118", weekday:1, start:"14:00", end:"15:35", weeks:[10,17] },

    { id:"c05", name:"程序设计基础", place:"主南 205", weekday:2, start:"09:55", end:"12:20", weeks:[[2,4],[6,10]] },
    { id:"c06", name:"航空航天概论 A", place:"主南 201", weekday:2, start:"15:55", end:"17:30", weeks:[1,17] },
    { id:"c07", name:"程设上机", place:"主南 205", weekday:2, start:"19:00", end:"21:25", weeks:[1,17], note:"提前占插座，带插排" },

    { id:"c08", name:"工科数学分析（Ⅰ）", place:"主 M301", weekday:3, start:"09:55", end:"12:20", weeks:[1,17] },
    { id:"c09", name:"启航学堂", place:"主 M302", weekday:3, start:"14:00", end:"15:35", weeks:[1,3,5,7,9,11,13,15,17] },
    { id:"c10", name:"国家安全", place:"待通知", weekday:3, start:"15:55", end:"17:30", weeks:[], note:"个别周，以通知为准" },
    { id:"c11", name:"走进软件", place:"主 M302 / (三)102", weekday:3, start:"19:00", end:"20:35", weeks:[1,17] },

    { id:"c12", name:"社会主义发展史", place:"主南 201", weekday:4, start:"09:55", end:"11:30", weeks:[2,9] },
    { id:"c13", name:"工科高等代数", place:"主 M201", weekday:4, start:"14:00", end:"15:35", weeks:[1,17] },

    { id:"c14", name:"习近平新时代…概论", place:"F228", weekday:5, start:"09:55", end:"11:30", weeks:[1,17] },
    { id:"c15", name:"心理健康", place:"主南 408", weekday:5, start:"14:00", end:"15:35", weeks:[2,2] },
    { id:"c16", name:"工科数学分析（Ⅰ）", place:"主 M301", weekday:5, start:"15:55", end:"17:30", weeks:[1,17] }
  ],

  /* ── 每日模板：days 省略=每天；jam=Jam 期间替换；jamOnly=只在 Jam 期间；noJam=Jam 期间消失 ── */
  routines: [
    { id:"r01", name:"起床，洗漱", start:"07:00", end:"07:20", color:"life", note:"闹钟只设一个，不按第二次" },
    { id:"r02", name:"早饭", start:"07:20", end:"07:50", color:"life" },
    { id:"r03", name:"空档：昨天的作业 + 预习", start:"08:00", end:"09:35", color:"study", days:[1,2,3,4,5], note:"没课的日子这块最值钱" },

    { id:"r04", name:"午饭", start:"11:30", end:"12:20", color:"life" },
    { id:"r05", name:"午睡 20–30 分钟", start:"12:20", end:"12:50", color:"life" },
    { id:"r06", name:"自习：作业当天清", start:"15:55", end:"17:30", color:"study", days:[1,2,3,4,5] },

    { id:"r07", name:"走 20 分钟（当天的运动）", start:"17:30", end:"17:50", color:"sport" },
    { id:"r08", name:"晚饭", start:"17:50", end:"18:20", color:"life" },

    { id:"r09", name:"主战场：自习（数分 / 高代 / 程设）", start:"19:00", end:"21:30", color:"study", days:[1,2,3,4,5], note:"最难的一门放脑子最清醒的时候" },

    { id:"r10", name:"画画 30 分钟", start:"21:30", end:"22:00", color:"art",
      note:"排线 + 临摹，画不动就 15 分钟",
      jam:{ name:"Jam：写 Godot", start:"21:30", end:"22:45" } },
    { id:"r11", name:"自由：游戏 / 刷手机", start:"22:00", end:"23:00", color:"life", noJam:true, note:"这是允许的娱乐，不内疚" },
    { id:"r12", name:"排线 15 分钟（Jam 期间别断）", start:"22:45", end:"23:00", color:"art", jamOnly:true },

    { id:"r13", name:"打卡 + 洗漱", start:"23:00", end:"23:20", color:"life" },
    { id:"r14", name:"上床，手机放桌上充电", start:"23:30", end:"23:59", color:"life" },

    { id:"w01", name:"补作业 + 一周复盘", start:"09:00", end:"11:30", color:"study", days:[6] },
    { id:"w02", name:"美术长块 2.5 小时", start:"14:00", end:"16:30", color:"art", days:[6], note:"一周唯一的长块，画完整的一张" },
    { id:"w03", name:"自由 / 社交", start:"19:00", end:"21:30", color:"life", days:[6], note:"周六晚上不排任务" },

    { id:"w04", name:"数学竞赛真题一套（限时 2 小时）", start:"09:00", end:"11:30", color:"study", days:[7], note:"11/14 之前每周一套" },
    { id:"w05", name:"体测训练：力量", start:"14:00", end:"14:30", color:"sport", days:[7] },
    { id:"w06", name:"机动：补欠的作业", start:"15:30", end:"17:30", color:"study", days:[7] },
    { id:"w07", name:"下周预习 + 看下周安排", start:"19:00", end:"20:30", color:"study", days:[7] },
    { id:"w08", name:"周复盘 + 打卡", start:"20:30", end:"21:00", color:"life", days:[7] }
  ],

  /* ── 跨天任务（甘特图的行） ── */
  tracks: [
    { id:"t01", name:"Godot 备赛", startDate:"2026-10-19", endDate:"2026-10-27", color:"study", note:"9 天，每天 1 小时" },
    { id:"t02", name:"Game Jam", startDate:"2026-10-28", endDate:"2026-11-11", color:"jam", hard:true, note:"必须提交一个能玩的版本" },
    { id:"t03", name:"数分第一轮", startDate:"2026-10-26", endDate:"2026-11-08", color:"study", note:"极限、连续、导数、中值定理" },
    { id:"t04", name:"高代第一轮", startDate:"2026-11-02", endDate:"2026-11-08", color:"study", note:"行列式、矩阵、线性方程组" },
    { id:"t05", name:"数学竞赛初赛", startDate:"2026-11-14", endDate:"2026-11-14", color:"fixed", hard:true, note:"当成数分模拟考" },
    { id:"t06", name:"期中", startDate:"2026-11-15", endDate:"2026-11-20", color:"fixed", hard:true, note:"数分、高代，其他一切暂停" },
    { id:"t07", name:"美术 90 天", startDate:"2026-10-19", endDate:"2027-01-16", color:"art", note:"每天 15–30 分钟，不断" },
    { id:"t08", name:"英语四级", startDate:"2026-12-19", endDate:"2026-12-19", color:"fixed", note:"以官方通知为准" },
    { id:"t09", name:"期末周", startDate:"2027-01-11", endDate:"2027-01-17", color:"fixed", note:"占位，等教务通知" }
  ],

  /* ── 一次性节点（不在甘特行里，但会出现在清单/学期轴） ── */
  events: [
    { id:"e01", name:"体测", pending:true, color:"fixed", note:"日期待定，老师通知后把 pending 改成 startDate/endDate" }
  ]
};
