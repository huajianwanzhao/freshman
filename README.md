# 日程台

一个纯静态的单页日程表。双击 `index.html` 就能用，不需要服务器、不需要联网、不需要装任何东西。

## 五个视图

| 视图 | 看什么 |
|---|---|
| 今日 | 现在几点、这一格是什么、今天还差几件事、打卡六格 |
| 周表 | 一周 6:00–24:00 全部时间块，一眼看空档 |
| 甘特 | 跨天任务：备赛、Jam、数分第一轮、竞赛、期中、90 天美术 |
| 清单 | 按天的文字表，能搜，能复制给别人 |
| 美术 | 90 天每天画什么，按周分组，打勾记进度 |

## 改内容

只改 `data.js` 一个文件，五个视图同时变：

- `courses` 课程：`weekday` 1=周一…7=周日；`weeks` 有四种写法
  - `[1,17]` 连续区间（1–17 周）
  - `[1,3,5,7]` 指定这几周
  - `[[2,4],[6,10]]` 两段区间（2–4 周 + 6–10 周）
  - `[]` 永远不显示（比如「个别周，等通知」的课）
- `routines` 每天重复的事：`days:[6]` 表示只在周六；`jam` 里写 Jam 期间的替换版本
- `tracks` 甘特横条：`startDate` / `endDate`，`hard:true` 表示不可挪动
- `events` 一次性节点，`pending:true` 表示日期未定
- `artPlan` 美术 90 天：`["2026-10-20","D3","标题",30,[步骤…],"检查点"]`，
  今日视图会自动把当天那条渲染成「今天画什么」卡片；`artLater` 是 12/13 之后的说明

## 打卡

勾选和屏幕时间存在浏览器 localStorage（key `dsh-schedule-v1`），不会上传。
清浏览器数据会丢，换设备不同步。

## 部署到 GitHub Pages

```bash
git init
git add index.html data.js app.js style.css README.md
git commit -m "日程台"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

然后仓库 Settings → Pages → Source 选 `Deploy from a branch` → Branch 选 `main` / `/(root)` → Save。
等一两分钟，网址是 `https://<用户名>.github.io/<仓库名>/`，手机直接打开就行。

提醒：GitHub Pages 是公开的。这里只有课程表和时间安排，没有隐私内容；介意就把仓库设成 Private（Private 仓库开 Pages 需要 Pro，另一种办法是只把去掉隐私的 data.js 放公开仓库）。

## 文件

- `index.html` 骨架
- `data.js` 数据（你唯一需要改的）
- `app.js` 渲染逻辑
- `style.css` 样式
- `规划.md` 设计说明（为什么这么排、M4/M5 做什么）
