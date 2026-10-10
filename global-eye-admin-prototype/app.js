const routes = {
  home: {
    title: "首页",
    breadcrumb: "管理后台 / 首页",
    tableTitle: "运营总览",
    tableSub: "汇总机构开通、方案运行、信源采集与操作风险，辅助后台日常巡检。",
    filters: [],
    columns: []
  },
  institutions: {
    title: "机构管理",
    breadcrumb: "管理后台 / 机构管理",
    tableTitle: "机构列表",
    tableSub: "基于统计单元展示已开通全球眼 SaaS 服务的机构，可维护服务周期、机构启停与配置额度。",
    filters: [
      ["unit", "统计单元", "select", ["", "总部费用", "浙江区域", "陕西一区", "四川区域", "湖南区域", "辽宁区域", "北京区域", "上海区域", "广东区域", "港澳区域"]],
      ["name", "机构名称", "text"],
      ["orgType", "产品类型", "select", ["", "正式", "试用"]],
      ["createdAt", "开通时间", "dateRange"],
      ["expireAt", "到期时间", "dateRange"]
    ],
    columns: ["序号", "统计单元", "机构名称", "机构类型", "销售人员", "机构状态", "到期倒计时", "服务周期", "操作"]
  },
  schemes: {
    title: "方案统计",
    breadcrumb: "管理后台 / 方案统计",
    tableTitle: "方案列表",
    tableSub: "展示已创建分析方案，可查看方案状态、数据总量与全部命中数据。",
    filters: [
      ["unit", "统计单元", "select", ["", "总部费用", "浙江区域", "陕西一区", "四川区域", "湖南区域", "辽宁区域", "北京区域", "上海区域", "广东区域", "港澳区域"]],
      ["org", "机构名称", "text"],
      ["name", "方案名称", "text"],
      ["type", "方案类型", "select", ["", "实时监测", "责任区监测", "深度挖掘"]],
      ["status", "方案状态", "select", ["", "运行中", "已暂停"]]
    ],
    columns: ["序号", "统计单元", "机构名称", "方案名称", "方案类型", "方案状态", "数据总量", "操作"]
  },
  websites: {
    title: "网址大全",
    breadcrumb: "管理后台 / 网址大全",
    tableTitle: "监测网站列表",
    tableSub: "维护全球核心信源监测网址，支持外部信源手动添加。",
    filters: [
      ["owner", "媒体归属", "select", ["", "中国", "美国", "英国", "日本", "泰国", "未知"]],
      ["url", "网站地址", "text"],
      ["name", "媒体名称", "text"],
      ["type", "媒体类型", "select", ["", "新闻媒体", "机构官网", "社交平台", "论坛社区"]],
      ["language", "语种类型", "select", ["", "英语", "中文（简体）", "日语", "泰语"]],
      ["status", "状态", "select", ["", "启用", "暂停", "异常"]],
      ["tags", "标签", "select", ["", "涉华议题", "北美信源", "重点客户", "待清理标签"]]
    ],
    columns: ["序号", "媒体名称", "网站地址", "标签", "媒体类型", "媒体归属", "语种类型", "添加人", "添加时间", "解析时间", "采集数据总量", "解析状态", "上次更新时间", "距上次更新时间", "操作"]
  },
  tags: {
    title: "标签管理",
    breadcrumb: "管理后台 / 标签管理",
    tableTitle: "标签列表",
    tableSub: "维护方案与信源使用的业务标签。",
    filters: [
      ["name", "标签名称", "text"],
      ["creator", "创建人", "text"]
    ],
    columns: ["序号", "标签名称", "标记数据量", "排序", "创建人", "更新时间", "操作"]
  },
  logs: {
    title: "操作日志",
    breadcrumb: "管理后台 / 操作日志",
    tableTitle: "操作日志列表",
    tableSub: "记录机构启停、授权变更、人员配置、标签配置、网址新增等关键管理操作。",
    filters: [
      ["module", "操作模块", "select", ["", "机构管理", "网址大全", "标签管理", "方案统计", "人员配置"]],
      ["action", "操作类型", "select", ["", "新增", "编辑", "删除", "启用/停用", "授权配置", "标签配置"]],
      ["target", "操作对象", "text"],
      ["operator", "操作人", "text"]
    ],
    columns: ["序号", "操作时间", "操作模块", "操作类型", "操作对象", "操作内容", "操作人", "IP地址", "结果"]
  }
};

const state = {
  route: "home",
  page: 1,
  pageSize: 100,
  filters: {},
  pendingAction: null,
  peopleRoleIndex: null,
  websiteTagIndex: null,
  tagEditIndex: -1,
  tagTypeTab: "数据标签",
  dateRangePicker: null
};

const baseCountryOptions = [
  "中国", "美国", "英国", "加拿大", "澳大利亚", "新西兰", "法国", "德国", "意大利", "日本",
  "巴西", "俄罗斯", "印度", "南非", "埃及", "埃塞俄比亚", "伊朗", "阿联酋", "印度尼西亚",
  "阿尔巴尼亚", "奥地利", "比利时", "保加利亚", "克罗地亚", "塞浦路斯", "捷克", "丹麦",
  "爱沙尼亚", "芬兰", "希腊", "匈牙利", "冰岛", "爱尔兰", "拉脱维亚", "立陶宛",
  "卢森堡", "马耳他", "黑山", "荷兰", "北马其顿", "挪威", "波兰", "葡萄牙", "罗马尼亚",
  "斯洛伐克", "斯洛文尼亚", "西班牙", "瑞典", "土耳其", "韩国", "墨西哥", "阿根廷", "沙特阿拉伯"
];

const data = {
  home: [],
  institutions: [
    {
      unit: "上海区域",
      name: "上海国际传播中心",
      shortName: "上海国传",
      region: "上海市",
      orgType: "正式",
      category: "一类: 网信部门",
      enabled: "启用",
      sales: "赵一",
      salesPhone: "13800008881",
      serviceStart: "2026-07-01",
      serviceEnd: "2027-06-30",
      contact: "刘主任 / 13800008888",
      config: {
        maxInfo: 30000000,
        maxPush: 100000,
        sourceLinks: 3000,
        pushSpeed: 300,
        monitorSchemes: 30,
        openedSchemes: 3,
        schemeMaxInfo: 300000,
        maxExports: 30000,
        topicSchemes: 30,
        openedTopics: 3,
        topicMaxExports: 30000
      }
    },
    {
      unit: "北京区域",
      name: "北京城市观察研究院",
      shortName: "北京城观",
      region: "北京市",
      orgType: "试用",
      category: "三类: 学校",
      enabled: "启用",
      sales: "钱二",
      salesPhone: "13800008882",
      serviceStart: "2026-06-10",
      serviceEnd: "2026-07-17",
      serviceEndTime: "18:30:00",
      contact: "王老师 / 13800009999",
      config: {
        maxInfo: 3000000,
        maxPush: 30000,
        sourceLinks: 500,
        pushSpeed: 100,
        monitorSchemes: 5,
        openedSchemes: 1,
        schemeMaxInfo: 50000,
        maxExports: 5000,
        topicSchemes: 5,
        openedTopics: 1,
        topicMaxExports: 5000
      }
    },
    {
      unit: "港澳区域",
      name: "香港公共事务资讯中心",
      shortName: "香港公资",
      region: "香港",
      orgType: "正式",
      category: "二类: 宣传部",
      enabled: "启用",
      sales: "孙三",
      salesPhone: "13800008883",
      serviceStart: "2026-01-01",
      serviceEnd: "2027-12-31",
      contact: "林女士 / 13800006666",
      config: {
        maxInfo: 20000000,
        maxPush: 80000,
        sourceLinks: 2000,
        pushSpeed: 260,
        monitorSchemes: 25,
        openedSchemes: 2,
        schemeMaxInfo: 250000,
        maxExports: 20000,
        topicSchemes: 25,
        openedTopics: 2,
        topicMaxExports: 20000
      }
    },
    {
      unit: "总部费用",
      name: "Global Media Lab",
      shortName: "GML",
      region: "海外",
      orgType: "试用",
      category: "三类: 企业",
      enabled: "停用",
      sales: "李四",
      salesPhone: "13800008884",
      serviceStart: "2026-05-01",
      serviceEnd: "2026-06-30",
      contact: "Lina Chen / 13800007777",
      config: {
        maxInfo: 1000000,
        maxPush: 10000,
        sourceLinks: 200,
        pushSpeed: 50,
        monitorSchemes: 3,
        openedSchemes: 0,
        schemeMaxInfo: 20000,
        maxExports: 3000,
        topicSchemes: 3,
        openedTopics: 0,
        topicMaxExports: 3000
      }
    },
    {
      unit: "广东区域",
      name: "粤港澳新闻数据中心",
      shortName: "粤港澳数据",
      region: "广东省",
      orgType: "正式",
      category: "一类: 网安部门",
      enabled: "停用",
      sales: "周五",
      salesPhone: "13800008885",
      serviceStart: "2025-07-01",
      serviceEnd: "2026-06-30",
      contact: "陈经理 / 13800005555",
      config: {
        maxInfo: 5000000,
        maxPush: 30000,
        sourceLinks: 800,
        pushSpeed: 120,
        monitorSchemes: 10,
        openedSchemes: 3,
        schemeMaxInfo: 100000,
        maxExports: 10000,
        topicSchemes: 10,
        openedTopics: 3,
        topicMaxExports: 10000
      }
    },
    {
      unit: "四川区域",
      name: "西南国际传播研究中心",
      shortName: "西南国传",
      region: "四川省",
      orgType: "试用",
      category: "一类: 网信部门",
      enabled: "启用",
      sales: "吴六",
      salesPhone: "13800008886",
      serviceStart: "2026-05-10",
      serviceEnd: "2026-07-10",
      contact: "唐老师 / 13800004444",
      config: {
        realtimeSchemes: 20,
        realtimeOpenSchemes: 20,
        dutySchemes: 10,
        dutyOpenSchemes: 10,
        schemeMaxInfo: 50000,
        schemeMaxExports: 30000,
        eventTotal: 10,
        eventOpenTotal: 3,
        eventMaxExports: 30000
      }
    },
    {
      unit: "辽宁区域",
      name: "东北亚舆情监测中心",
      shortName: "东北亚舆情",
      region: "辽宁省",
      orgType: "正式",
      category: "一类: 网信部门",
      enabled: "启用",
      sales: "郑七",
      salesPhone: "13800008887",
      serviceStart: "2026-01-20",
      serviceEnd: "2026-07-21",
      contact: "韩主任 / 13800003333",
      config: {
        realtimeSchemes: 20,
        realtimeOpenSchemes: 20,
        dutySchemes: 10,
        dutyOpenSchemes: 10,
        schemeMaxInfo: 50000,
        schemeMaxExports: 30000,
        eventTotal: 10,
        eventOpenTotal: 3,
        eventMaxExports: 30000
      }
    },
    {
      unit: "陕西一区",
      name: "欧洲华文资讯中心",
      shortName: "欧洲华文",
      region: "海外",
      orgType: "试用",
      category: "二类: 宣传部",
      enabled: "启用",
      sales: "冯八",
      salesPhone: "13800008888",
      serviceStart: "2026-06-01",
      serviceEnd: "2026-07-28",
      contact: "Eva Liu / 13800002222",
      config: {
        realtimeSchemes: 20,
        realtimeOpenSchemes: 20,
        dutySchemes: 10,
        dutyOpenSchemes: 10,
        schemeMaxInfo: 50000,
        schemeMaxExports: 30000,
        eventTotal: 10,
        eventOpenTotal: 3,
        eventMaxExports: 30000
      }
    },
    {
      unit: "浙江区域",
      name: "长三角公共信息研究院",
      shortName: "长三角公信",
      region: "浙江省",
      orgType: "正式",
      category: "一类: 网安部门",
      enabled: "启用",
      sales: "许九",
      salesPhone: "13800008889",
      serviceStart: "2026-02-01",
      serviceEnd: "2026-08-05",
      contact: "赵老师 / 13800001111",
      config: {
        realtimeSchemes: 20,
        realtimeOpenSchemes: 20,
        dutySchemes: 10,
        dutyOpenSchemes: 10,
        schemeMaxInfo: 50000,
        schemeMaxExports: 30000,
        eventTotal: 10,
        eventOpenTotal: 3,
        eventMaxExports: 30000
      }
    },
    {
      unit: "湖南区域",
      name: "澳门城市传播中心",
      shortName: "澳门城传",
      region: "澳门",
      orgType: "试用",
      category: "二类: 消防",
      enabled: "启用",
      sales: "沈十",
      salesPhone: "13800008890",
      serviceStart: "2026-06-20",
      serviceEnd: "2026-07-23",
      contact: "何主任 / 13800001010",
      config: {
        realtimeSchemes: 20,
        realtimeOpenSchemes: 20,
        dutySchemes: 10,
        dutyOpenSchemes: 10,
        schemeMaxInfo: 50000,
        schemeMaxExports: 30000,
        eventTotal: 10,
        eventOpenTotal: 3,
        eventMaxExports: 30000
      }
    }
  ],
  schemes: [
    { unit: "上海区域", org: "上海国际传播中心", name: "海外社媒涉华议题监测", type: "实时监测", status: "运行中", sourceId: "DS-10082", keywords: "China, Trade, Shanghai", excludes: "sport, travel", hits: 1286, latest: "2026-07-14 16:42:10" },
    { unit: "北京区域", org: "北京城市观察研究院", name: "城市公共安全舆情", type: "责任区监测", status: "运行中", sourceId: "DS-10093", keywords: "public safety, city", excludes: "movie", hits: 438, latest: "2026-07-14 17:05:22" },
    { unit: "港澳区域", org: "香港公共事务资讯中心", name: "港澳台重点媒体追踪", type: "实时监测", status: "已暂停", sourceId: "DS-10021", keywords: "Hong Kong, Macao", excludes: "coupon", hits: 0, latest: "-" },
    { unit: "广东区域", org: "粤港澳新闻数据中心", name: "南向新闻站点巡检", type: "深度挖掘", status: "已暂停", sourceId: "DS-10065", keywords: "Greater Bay Area", excludes: "weather", hits: 92, latest: "2026-07-13 21:30:18" }
  ],
  websites: [
    { id: 4469, name: "国际航空运输协会(日内瓦)", url: "https://www.iata.org", tags: ["重点客户"], type: "机构官网", owner: "美国", language: "英语", creator: "张松涛", addedAt: "2026-07-16 16:01:24", parsedAt: "2026-07-14 17:35:54", lastUpdatedAt: "2026-07-16 00:00:00", elapsed: "1天", collectedCount: 1286 },
    { id: 10881, name: "redlanternanalytica", url: "https://redlanternanalytica.com", tags: ["北美信源"], type: "新闻媒体", owner: "美国", language: "英语", creator: "张松涛", addedAt: "2026-07-15 00:00:17", parsedAt: "2026-07-08 14:37:18", lastUpdatedAt: "2026-07-14 15:51:24", elapsed: "2天", collectedCount: 438 },
    { id: 4362, name: "国家社会主义日本劳动者党", url: "", tags: [], type: "新闻媒体", owner: "未知", language: "日语", creator: "张松涛", addedAt: "2026-07-08 11:30:51", parsedAt: "2026-07-07 16:26:59", lastUpdatedAt: "", elapsed: "", collectedCount: 0 },
    { id: 4717, name: "路透社", url: "https://www.reuters.com", tags: ["涉华议题"], type: "新闻媒体", owner: "英国", language: "英语", creator: "张松涛", addedAt: "2026-07-08 11:21:25", parsedAt: "2026-07-06 15:28:30", lastUpdatedAt: "2026-07-07 14:45:54", elapsed: "9天", collectedCount: 92 },
    { id: 259, name: "中国数字时代", url: "https://chinadigitaltimes.net", tags: ["涉华议题", "北美信源"], type: "新闻媒体", owner: "美国", language: "英语", creator: "张松涛", addedAt: "2026-07-16 00:34:08", parsedAt: "2026-07-01 17:30:36", lastUpdatedAt: "2026-07-15 00:00:00", elapsed: "2天", collectedCount: 756 },
    { id: 3033, name: "新闻速报", url: "https://www.newsbreak.com", tags: ["北美信源"], type: "新闻媒体", owner: "美国", language: "英语", creator: "张松涛", addedAt: "2026-07-08 11:22:16", parsedAt: "2026-07-01 15:23:22", lastUpdatedAt: "2026-07-01 04:12:29", elapsed: "16天", collectedCount: 0, stale: true },
    { id: 5137, name: "Spring News", url: "https://www.springnews.co.th", tags: [], type: "新闻媒体", owner: "泰国", language: "泰语", creator: "张松涛", addedAt: "2026-07-16 18:41:43", parsedAt: "2026-06-30 17:28:48", lastUpdatedAt: "2026-07-16 18:33:00", elapsed: "16小时", collectedCount: 214 },
    { id: 10495, name: "Schneier on Security", url: "https://www.schneier.com", tags: ["北美信源"], type: "新闻媒体", owner: "美国", language: "英语", creator: "张松涛", addedAt: "2026-07-16 22:53:06", parsedAt: "2026-06-30 16:05:48", lastUpdatedAt: "2026-07-16 14:34:31", elapsed: "20小时", collectedCount: 389 },
    { id: 116, name: "正见网", url: "https://www.zhengjian.org", tags: ["涉华议题"], type: "新闻媒体", owner: "美国", language: "中文（简体）", creator: "张松涛", addedAt: "2026-07-16 22:54:44", parsedAt: "2026-06-30 15:19:32", lastUpdatedAt: "2026-07-16 00:00:00", elapsed: "1天", collectedCount: 167 },
    { id: 10880, name: "早晨报中文网", url: "https://www.zaochenbao.com", tags: ["待清理标签"], type: "新闻媒体", owner: "中国", language: "中文（简体）", creator: "郑辉", addedAt: "2026-07-17 10:57:05", parsedAt: "2026-06-30 09:46:49", parseStatus: "待解析", lastUpdatedAt: "2026-07-17 10:51:00", elapsed: "15分钟", collectedCount: 58 }
  ],
  tags: [
    { type: "数据标签", name: "重点关注", markedCount: 18, sort: 1, creator: "运营管理员", updated: "2026-07-14 15:20:00" },
    { type: "网站标签", name: "涉华议题", markedCount: 18, sort: 2, creator: "运营管理员", updated: "2026-07-14 15:20:00" },
    { type: "网站标签", name: "北美信源", markedCount: 7, sort: 3, creator: "运营管理员", updated: "2026-07-13 11:08:12" },
    { type: "网站标签", name: "重点客户", markedCount: 11, sort: 4, creator: "销售主管", updated: "2026-07-12 09:30:45" },
    { type: "网站标签", name: "待清理标签", markedCount: 0, sort: 5, creator: "运营管理员", updated: "2026-06-30 18:00:00" },
    { type: "国家分组", name: "五眼联盟", code: "FVEY", groupType: "安全情报联盟", countries: ["美国", "英国", "加拿大", "澳大利亚", "新西兰"], sort: 1, enabled: "启用", updater: "运营管理员", updated: "2026-07-22 10:00:00" },
    { type: "国家分组", name: "北约", code: "NATO", groupType: "安全联盟", countries: ["阿尔巴尼亚", "比利时", "保加利亚", "加拿大", "克罗地亚", "捷克", "丹麦", "爱沙尼亚", "芬兰", "法国", "德国", "希腊", "匈牙利", "冰岛", "意大利", "拉脱维亚", "立陶宛", "卢森堡", "黑山", "荷兰", "北马其顿", "挪威", "波兰", "葡萄牙", "罗马尼亚", "斯洛伐克", "斯洛文尼亚", "西班牙", "瑞典", "土耳其", "英国", "美国"], sort: 2, enabled: "启用", updater: "运营管理员", updated: "2026-07-21 16:30:00" },
    { type: "国家分组", name: "欧盟", code: "EU", groupType: "区域组织", countries: ["奥地利", "比利时", "保加利亚", "克罗地亚", "塞浦路斯", "捷克", "丹麦", "爱沙尼亚", "芬兰", "法国", "德国", "希腊", "匈牙利", "爱尔兰", "意大利", "拉脱维亚", "立陶宛", "卢森堡", "马耳他", "荷兰", "波兰", "葡萄牙", "罗马尼亚", "斯洛伐克", "斯洛文尼亚", "西班牙", "瑞典"], sort: 3, enabled: "启用", updater: "运营管理员", updated: "2026-07-20 14:20:00" },
    { type: "国家分组", name: "金砖国家", code: "BRICS", groupType: "经济合作机制", countries: ["巴西", "俄罗斯", "印度", "中国", "南非", "埃及", "埃塞俄比亚", "伊朗", "阿联酋", "印度尼西亚"], sort: 4, enabled: "启用", updater: "运营管理员", updated: "2026-07-19 11:15:00" },
    { type: "国家分组", name: "七国集团", code: "G7", groupType: "经济合作组织", countries: ["加拿大", "法国", "德国", "意大利", "日本", "英国", "美国"], sort: 5, enabled: "启用", updater: "运营管理员", updated: "2026-07-18 09:40:00" }
  ],
  logs: [
    { time: "2026-07-20 17:42:18", module: "机构管理", action: "启用/停用", target: "Global Media Lab", content: "停用机构服务开关", operator: "汪艳琼", ip: "10.18.6.24", result: "成功" },
    { time: "2026-07-20 16:35:09", module: "网址大全", action: "标签配置", target: "中国数字时代", content: "配置标签：涉华议题、北美信源", operator: "汪艳琼", ip: "10.18.6.24", result: "成功" },
    { time: "2026-07-20 15:12:44", module: "人员配置", action: "授权配置", target: "Seven", content: "配置用户角色为管理员", operator: "汪艳琼", ip: "10.18.6.24", result: "成功" },
    { time: "2026-07-19 18:20:31", module: "标签管理", action: "新增", target: "待清理标签", content: "新增业务标签", operator: "运营管理员", ip: "10.18.6.11", result: "成功" },
    { time: "2026-07-19 10:08:52", module: "网址大全", action: "新增", target: "早晨报中文网", content: "新增外部监测网站", operator: "郑辉", ip: "10.18.6.38", result: "成功" },
    { time: "2026-07-18 09:33:16", module: "方案统计", action: "启用/停用", target: "城市公共安全舆情", content: "暂停方案运行状态", operator: "汪艳琼", ip: "10.18.6.24", result: "成功" }
  ]
};

const samples = {
  schemeRows: [
    {
      title: "日本の次世代サイバーセキュリティ戦略: AI駆動型防御の確立と重要インフラの防護策",
      summary: "日本政府拟将人工智能防御系统部署到通信、电力等重要基础设施，以应对复杂网络安全攻击。",
      source: "NHK News",
      author: "佐藤健太",
      publishTime: "2024-07-08 15:30:10",
      sentiment: "积极",
      risk: "I级:零星非议",
      platform: "新闻信源",
      language: "日语",
      location: "日本 · 东京都",
      mediaType: "新闻媒体",
      keywords: ["AI", "网络安全", "重点关注"]
    },
    {
      title: "关于某地区近期公共基础设施维护现状的深度调研报告与未来财政预算分配漏洞分析",
      summary: "调查报告称目标区域公共基础设施出现系统性退化，维护预算分配与交通通信网络结构性漏洞受到关注。",
      source: "CNN Business",
      author: "Alex M.",
      publishTime: "2024-07-08 14:32:10",
      sentiment: "负面",
      risk: "IV级:刻意抹黑",
      platform: "研究机构",
      language: "英语",
      location: "北美 · 加利福尼亚",
      mediaType: "机构官网",
      keywords: ["基础设施", "公共安全", "财政风险"]
    },
    {
      title: "最新行业研报：2024年亚太地区供应链多元化与物流重组进展深度评估",
      summary: "跨国公司持续推进“中国+1”策略，东南亚工业园区资金流入增加，但港口容量与能源供应仍是扩张瓶颈。",
      source: "Nikkei Asia",
      author: "M. Taniguchi",
      publishTime: "2024-07-08 11:45:00",
      sentiment: "中性",
      risk: "II级:外界关切",
      platform: "新闻信源",
      language: "英语",
      location: "亚太 · 日本",
      mediaType: "新闻媒体",
      keywords: ["供应链", "亚太物流", "地缘动态"]
    },
    {
      title: "针对大型核心通信枢纽潜在漏洞的灰色产业攻击工具泄露与利用链研判",
      summary: "安全社区披露疑似针对通信网关的利用链，相关讨论在境外技术论坛和社交平台快速传播。",
      source: "SecWatch Global",
      author: "Security Desk",
      publishTime: "2024-07-08 10:18:33",
      sentiment: "负面",
      risk: "V级:攻击动员",
      platform: "独立信源",
      language: "英语",
      location: "全球",
      mediaType: "专业论坛",
      keywords: ["网络安全", "安全隐患", "重点关注"]
    },
    {
      title: "全球智能电网数字化大会：解析高压输变电设备预测性维护的核心算法与数字孪生演练",
      summary: "会议展示多模态深度学习算法在高压绝缘子裂缝识别中的应用，预测性维护方案受到多国工程师关注。",
      source: "IEEE Spectrum",
      author: "Energy Tech Lab",
      publishTime: "2024-07-07 18:20:12",
      sentiment: "中性",
      risk: "II级:外界关切",
      platform: "研究机构",
      language: "英语",
      location: "美国 · 纽约",
      mediaType: "研究机构",
      keywords: ["智能电网", "AI", "技术革命"]
    },
    {
      title: "海外社交网络针对某高新技术孵化区环境测评的失实抹黑与舆论回击",
      summary: "境外社交平台出现围绕高新技术孵化区环境测评的失实内容，中方机构和专家账号陆续发布澄清回应。",
      source: "Twitter / X",
      author: "Global Eco Watch",
      publishTime: "2024-07-07 15:12:48",
      sentiment: "负面",
      risk: "III级:舆论批判",
      platform: "社交平台",
      language: "英语",
      location: "北美 · 社交网络",
      mediaType: "社交媒体",
      keywords: ["环保舆情", "海外媒体", "需要翻译"]
    }
  ],
  people: [
    { nick: "Tyr_pc", name: "", role: "", followedAt: "", configuredAt: "", lastLoginAt: "", status: "未关注", configured: false, avatar: "avatar-a" },
    { nick: "Seven", name: "威中彪", role: "管理员", followedAt: "2026-06-04 16:57:26", configuredAt: "2026-07-09 01:24:40", lastLoginAt: "", status: "已关注已配置", configured: true, avatar: "avatar-b" },
    { nick: "史乐乐", name: "史乐乐", role: "", followedAt: "2026-06-26 12:26:17", configuredAt: "", lastLoginAt: "2026-07-13 15:13:01", status: "已关注未配置", configured: false, avatar: "avatar-c" },
    { nick: "domo", name: "穆瑶强", role: "管理员", followedAt: "2026-06-25 20:29:38", configuredAt: "2026-07-09 01:24:47", lastLoginAt: "2026-07-09 11:01:53", status: "已关注已配置", configured: true, avatar: "avatar-d" },
    { nick: "湖南省网信办", name: "湖南省网信办", role: "", followedAt: "", configuredAt: "", lastLoginAt: "", status: "未关注", configured: false, avatar: "avatar-e" },
    { nick: "夜", name: "郑华", role: "", followedAt: "", configuredAt: "", lastLoginAt: "", status: "未关注", configured: false, avatar: "avatar-f" }
  ]
};

const defaultInstitutionConfig = {
  realtimeSchemes: 20,
  realtimeOpenSchemes: 20,
  dutySchemes: 10,
  dutyOpenSchemes: 10,
  schemeMaxInfo: 50000,
  schemeMaxExports: 30000,
  eventTotal: 10,
  eventOpenTotal: 3,
  eventMaxExports: 30000
};

function normalizeConfig(config = {}) {
  return {
    realtimeSchemes: config.realtimeSchemes ?? config.monitorSchemes ?? defaultInstitutionConfig.realtimeSchemes,
    realtimeOpenSchemes: config.realtimeOpenSchemes ?? config.openedSchemes ?? defaultInstitutionConfig.realtimeOpenSchemes,
    dutySchemes: config.dutySchemes ?? config.topicSchemes ?? defaultInstitutionConfig.dutySchemes,
    dutyOpenSchemes: config.dutyOpenSchemes ?? config.openedTopics ?? defaultInstitutionConfig.dutyOpenSchemes,
    schemeMaxInfo: config.schemeMaxInfo ?? defaultInstitutionConfig.schemeMaxInfo,
    schemeMaxExports: config.schemeMaxExports ?? config.maxExports ?? defaultInstitutionConfig.schemeMaxExports,
    eventTotal: config.eventTotal ?? config.topicSchemes ?? defaultInstitutionConfig.eventTotal,
    eventOpenTotal: config.eventOpenTotal ?? config.openedTopics ?? defaultInstitutionConfig.eventOpenTotal,
    eventMaxExports: config.eventMaxExports ?? config.topicMaxExports ?? defaultInstitutionConfig.eventMaxExports
  };
}

const els = {
  breadcrumb: document.querySelector("#breadcrumb"),
  pageTitle: document.querySelector("#pageTitle"),
  stats: document.querySelector("#stats"),
  filters: document.querySelector("#filters"),
  tableTitle: document.querySelector("#tableTitle"),
  tableSub: document.querySelector("#tableSub"),
  toolbar: document.querySelector("#toolbar"),
  tableHead: document.querySelector("#tableHead"),
  tableBody: document.querySelector("#tableBody"),
  emptyState: document.querySelector("#emptyState"),
  totalText: document.querySelector("#totalText"),
  pageText: document.querySelector("#pageText"),
  prevPage: document.querySelector("#prevPage"),
  nextPage: document.querySelector("#nextPage"),
  pageSize: document.querySelector("#pageSize"),
  jumpPage: document.querySelector("#jumpPage"),
  drawerMask: document.querySelector("#drawerMask"),
  drawer: document.querySelector("#drawer"),
  modalMask: document.querySelector("#modalMask"),
  modal: document.querySelector("#modal"),
  formPage: document.querySelector("#formPage"),
  pageTabs: document.querySelector("#pageTabs"),
  queryPanel: document.querySelector(".query-panel"),
  contentSection: document.querySelector(".content-section"),
  toast: document.querySelector("#toast")
};

function statusClass(status) {
  if (["已开通", "运行中", "启用", "正式", "成功", "已采集", "已解析", "未锁定"].includes(status)) return "success";
  if (["即将到期", "已暂停", "试用", "暂停", "采集中", "待解析", "已锁定"].includes(status)) return "warning";
  if (["已到期", "分析失败", "访问异常", "停用", "异常", "采集异常", "无法解析"].includes(status)) return "danger";
  if (["已关闭", "数据标签", "网站标签", "未采集"].includes(status)) return "progress";
  return "";
}

function tag(status) {
  return `<span class="tag ${statusClass(status)}">${status}</span>`;
}

function clipCell(value, className = "") {
  const text = value || "";
  return `<span class="cell-clip ${className}" title="${text}">${text}</span>`;
}

function websiteStatus(row) {
  return row.status || (row.stale ? "异常" : "启用");
}

function websiteParseStatus(row) {
  if (row.parseStatus) return row.parseStatus;
  if (row.stale || !row.url) return "无法解析";
  if (!row.parsedAt) return "待解析";
  return "已解析";
}

function websiteLockStatus(row) {
  if (row.lockStatus) return row.lockStatus;
  return row.stale || !row.url ? "已锁定" : "未锁定";
}

function addOperationLog(module, action, target, content, result = "成功") {
  data.logs.unshift({
    time: nowText(),
    module,
    action,
    target,
    content,
    operator: "汪艳琼",
    ip: "10.18.6.24",
    result
  });
}

function monitorToneClass(sentiment) {
  if (sentiment === "积极") return "positive";
  if (sentiment === "负面") return "negative";
  return "neutral";
}

function riskClass(risk = "") {
  return risk.startsWith("IV") || risk.startsWith("V") ? "risk-high" : "risk-normal";
}

function renderKeywordChips(keywords = []) {
  return keywords.map((keyword) => `<span class="monitor-keyword">${keyword}</span>`).join("");
}

function renderMonitorDataList(sourceName = "") {
  return samples.schemeRows.map((item) => `
    <article class="monitor-data-card">
      <div class="monitor-card-top">
        <div class="monitor-badges">
          <span class="monitor-badge ${monitorToneClass(item.sentiment)}">${item.sentiment}</span>
          <span class="monitor-badge ${riskClass(item.risk)}">${item.risk}</span>
          <span class="monitor-badge neutral">${item.platform}</span>
          <span class="monitor-badge neutral">${item.mediaType}</span>
        </div>
        <span class="monitor-time">${item.publishTime}</span>
      </div>
      <h4 class="monitor-title">${item.title}</h4>
      <p class="monitor-summary">${item.summary}</p>
      <div class="monitor-meta">
        <span>来源：${sourceName || item.source}</span>
        <span>语种类型：${item.language}</span>
        <span>作者：${item.author}</span>
        <span>媒体归属：${item.location}</span>
      </div>
      <div class="monitor-card-bottom">
        <div class="monitor-keywords">${renderKeywordChips(item.keywords)}</div>
        <div class="monitor-card-actions">
          <button class="btn text">原文</button>
          <button class="btn text">复制</button>
        </div>
      </div>
    </article>
  `).join("");
}

function websiteTagsCell(row, index) {
  const chips = (row.tags || []).length
    ? row.tags.map((name) => `<span class="site-tag-chip">${name}</span>`).join("")
    : `<span class="site-tag-empty">未配置</span>`;
  return `<div class="site-tags-cell"><div class="site-tag-list">${chips}</div></div>`;
}

function websiteTagsModal(row) {
  const rowIndex = data.websites.indexOf(row);
  if (rowIndex < 0) return;
  state.websiteTagIndex = rowIndex;
  const selected = new Set(row.tags || []);
  const websiteTags = data.tags.filter((item) => item.type === "网站标签");
  const options = websiteTags.map((item) => `
    <label class="check-option">
      <input type="checkbox" class="website-tag-option" value="${item.name}" ${selected.has(item.name) ? "checked" : ""} />
      <span>${item.name}</span>
    </label>
  `).join("");
  showModal("配置网站标签", `
    <div class="tag-config-panel">
      <div class="field full"><label>媒体名称</label><input value="${row.name}" readonly /></div>
      <div class="check-list">${options}</div>
    </div>
  `, `<button class="btn" data-action="closeModal">取消</button><button class="btn primary" data-action="saveWebsiteTags">保存</button>`);
}

function serviceState(row) {
  const today = new Date("2026-07-22T00:00:00");
  const end = new Date(`${row.serviceEnd}T${row.serviceEndTime || "23:59:59"}`);
  const diffMs = end.getTime() - today.getTime();
  if (diffMs <= 0) return { label: `已到期 ${durationText(Math.abs(diffMs))}`, expired: true };
  const dayMs = 24 * 60 * 60 * 1000;
  if (diffMs >= dayMs) {
    return { label: `剩余 ${Math.ceil(diffMs / dayMs)} 天`, expired: false };
  }
  const totalMinutes = Math.max(1, Math.floor(diffMs / (60 * 1000)));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { label: `剩余 ${hours} 时 ${minutes} 分`, expired: false };
}

function durationText(ms) {
  const dayMs = 24 * 60 * 60 * 1000;
  const hourMs = 60 * 60 * 1000;
  const minuteMs = 60 * 1000;
  const days = Math.floor(ms / dayMs);
  const hours = Math.floor((ms % dayMs) / hourMs);
  if (days > 0) return hours > 0 ? `${days} 天 ${hours} 时` : `${days} 天`;
  const minutes = Math.max(1, Math.floor((ms % hourMs) / minuteMs));
  return hours > 0 ? `${hours} 时 ${minutes} 分` : `${minutes} 分`;
}

function isExpiringWithin(row, days) {
  const today = new Date("2026-07-22T00:00:00");
  const end = new Date(`${row.serviceEnd}T${row.serviceEndTime || "23:59:59"}`);
  const diffMs = end.getTime() - today.getTime();
  return diffMs > 0 && diffMs <= days * 24 * 60 * 60 * 1000;
}

function isExpiredWithin(row, days) {
  const today = new Date("2026-07-22T00:00:00");
  const end = new Date(`${row.serviceEnd}T${row.serviceEndTime || "23:59:59"}`);
  const diffMs = today.getTime() - end.getTime();
  return diffMs >= 0 && diffMs <= days * 24 * 60 * 60 * 1000;
}

function isExpiryRiskWithin(row, days) {
  return isExpiringWithin(row, days) || isExpiredWithin(row, days);
}

function formatNumber(value) {
  return Number(value).toLocaleString("zh-CN");
}

function servicePeriod(row) {
  return `${row.serviceStart} 至 ${row.serviceEnd}`;
}

function readonlyField(label, value, id) {
  return `<div class="field"><label>${label}</label><input id="${id}" value="${value || ""}" placeholder="从MT系统同步" readonly /></div>`;
}

function institutionOptions() {
  return data.institutions.map((item) => `<option value="${item.name}"></option>`).join("");
}

function institutionNameControl(row, isEdit) {
  if (isEdit) {
    return `<div class="field"><label class="required">机构名称</label><input value="${row.name || ""}" readonly /></div>`;
  }
  return `<div class="field"><label class="required">机构名称</label><input id="institutionNameInput" value="${row.name || ""}" list="institutionNameOptions" placeholder="请选择机构，支持输入内容检索" autocomplete="off" /><datalist id="institutionNameOptions">${institutionOptions()}</datalist></div>`;
}

function expiryPicker(value) {
  return `
    <div class="field date-picker-field">
      <label class="required">到期时间</label>
      <div class="date-picker-shell" data-action="toggleExpiryPicker">
        <input id="expiryDateInput" value="${value || ""}" placeholder="年/月/日" readonly />
        <button class="calendar-trigger" type="button">□</button>
        <div class="date-picker-popover hidden" id="expiryDatePopover">
          <div class="quick-dates">
            <button data-action="quickExpiry" data-days="15" type="button">15天后</button>
            <button data-action="quickExpiry" data-days="30" type="button">30天后</button>
            <button data-action="quickExpiry" data-days="183" type="button">半年后</button>
            <button data-action="quickExpiry" data-days="365" type="button">1年后</button>
          </div>
          <div class="calendar-panel">
            <div class="calendar-head">
              <button type="button">«</button>
              <button type="button">‹</button>
              <strong>2026 年&nbsp;&nbsp;6 月</strong>
              <button type="button">›</button>
              <button type="button">»</button>
            </div>
            <div class="calendar-week"><span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span></div>
            <div class="calendar-days">
              ${calendarDays()}
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

function calendarDays() {
  const days = [
    ["31", "muted"], ["1", ""], ["2", ""], ["3", ""], ["4", ""], ["5", ""], ["6", ""],
    ["7", ""], ["8", ""], ["9", ""], ["10", "selected"], ["11", ""], ["12", ""], ["13", ""],
    ["14", ""], ["15", ""], ["16", ""], ["17", ""], ["18", ""], ["19", ""], ["20", ""],
    ["21", ""], ["22", ""], ["23", ""], ["24", ""], ["25", ""], ["26", ""], ["27", ""],
    ["28", ""], ["29", ""], ["30", ""], ["1", "muted"], ["2", "muted"], ["3", "muted"], ["4", "muted"],
    ["5", "muted"], ["6", "muted"], ["7", "muted"], ["8", "muted"], ["9", "muted"], ["10", "muted"], ["11", "muted"]
  ];
  return days.map(([day, cls]) => `<button class="${cls}" data-action="selectExpiryDate" data-date="${Number(day) <= 30 && cls !== "muted" ? `2026-06-${String(day).padStart(2, "0")}` : ""}" type="button">${day}</button>`).join("");
}

function setRoute(route) {
  if (!routes[route]) {
    document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.route === route));
    return;
  }
  state.route = route;
  state.page = 1;
  state.filters = {};
  resetToListView();
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.route === route));
  render();
}

function resetToListView() {
  closeDrawer();
  closeModal();
  els.formPage.classList.add("hidden");
  els.formPage.innerHTML = "";
  els.queryPanel.classList.remove("hidden");
  els.contentSection.classList.remove("hidden");
}

function countryOptionList() {
  const configuredCountries = data.tags
    .filter((row) => row.type === "国家分组")
    .flatMap((row) => row.countries || []);
  return Array.from(new Set([...baseCountryOptions, ...configuredCountries]))
    .sort((left, right) => left.localeCompare(right, "zh-CN"));
}

function getRows() {
  return data[state.route].filter((row) => {
    if (state.route === "tags" && row.type !== state.tagTypeTab) return false;
    return Object.entries(state.filters).every(([key, value]) => {
      if (!value) return true;
      if (key.endsWith("Start") || key.endsWith("End")) return true;
      if (state.route === "websites" && key === "tags") return (row.tags || []).includes(value);
      if (state.route === "websites" && key === "status") return websiteStatus(row) === value;
      if (state.route === "tags" && key === "memberCountry") return (row.countries || []).includes(value);
      return String(row[key] ?? "").toLowerCase().includes(value.toLowerCase());
    });
  });
}

const statIconPaths = {
  building: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18"/><path d="M2 22h20"/><path d="M10 6h4M10 10h4M10 14h4M10 18h4"/>',
  certificate: '<circle cx="12" cy="8" r="5"/><path d="m9.5 8 1.6 1.6L14.5 6"/><path d="m8.2 12.8-1 9.2 4.8-3 4.8 3-1-9.2"/>',
  account: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  expire: '<path d="M8 2v4M16 2v4M3 10h18"/><rect x="3" y="4" width="18" height="17" rx="2"/><circle cx="15.5" cy="15.5" r="3.5"/><path d="M15.5 13.5v2.2l1.5 1"/>',
  realtime: '<path d="M3 12h4l2.5-7 5 14 2.5-7h4"/>',
  duty: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
  deep: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4M11 8v6M8 11h6"/>',
  media: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>'
};

function metricCards(metrics) {
  return metrics.map(([label, value, hint = "", icon = "", tone = "blue", drilldown = ""]) => {
    const iconMarkup = icon ? `
      <i class="stat-icon ${icon}" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">${statIconPaths[icon] || ""}</svg>
      </i>` : "";
    const tagName = drilldown ? "button" : "div";
    const interaction = drilldown
      ? `type="button" class="stat-item drillable ${icon ? `with-icon ${tone}` : ""}" data-action="homeMetricDrilldown" data-drilldown="${drilldown}" title="查看${label}明细"`
      : `class="stat-item ${icon ? `with-icon ${tone}` : ""}"`;
    return `
      <${tagName} ${interaction}>
        ${iconMarkup}
        <div class="stat-copy">
          <span>${label}</span>
          <strong>${value}</strong>
          ${hint ? `<em>${hint}</em>` : ""}
        </div>
      </${tagName}>
    `;
  }).join("");
}

function institutionMetrics() {
  const rows = data.institutions;
  return [
    ["开通机构数", rows.length],
    ["启用机构数", rows.filter((item) => item.enabled === "启用").length],
    ["30天内即将到期", rows.filter((item) => isExpiringWithin(item, 30)).length],
    ["正式/试用机构", `${rows.filter((item) => item.orgType === "正式").length}/${rows.filter((item) => item.orgType === "试用").length}`],
    ["已停用机构", rows.filter((item) => item.enabled === "停用").length]
  ];
}

function schemeMetrics() {
  const rows = data.schemes;
  return [
    ["方案总数", rows.length],
    ["运行中方案", rows.filter((item) => item.status === "运行中").length],
    ["已暂停方案", rows.filter((item) => item.status === "已暂停").length],
    ["命中数据总量", formatNumber(rows.reduce((sum, item) => sum + item.hits, 0))],
    ["零数据方案", rows.filter((item) => item.hits === 0).length]
  ];
}

function websiteMetrics() {
  const rows = data.websites;
  return [
    ["信源总数", rows.length],
    ["采集数据总量", formatNumber(rows.reduce((sum, item) => sum + (item.collectedCount || 0), 0))],
    ["已解析信源", rows.filter((item) => websiteParseStatus(item) === "已解析").length],
    ["待解析信源", rows.filter((item) => websiteParseStatus(item) === "待解析").length],
    ["无法解析信源", rows.filter((item) => websiteParseStatus(item) === "无法解析").length],
    ["未配置标签信源", rows.filter((item) => !(item.tags || []).length).length]
  ];
}

function homeAnalysisMetrics() {
  const institutions = data.institutions;
  const schemes = data.schemes;
  const formalCount = institutions.filter((item) => item.orgType === "正式").length;
  const trialCount = institutions.filter((item) => item.orgType === "试用").length;
  return [
    ["开通机构数", institutions.length, "", "building", "blue", "institutions"],
    ["正式/试用机构", `${formalCount} / ${trialCount}`, "", "certificate", "cyan", "institutionTypes"],
    ["账号数量", samples.people.length, "", "account", "purple"],
    ["近30天产品到期机构", institutions.filter((item) => isExpiryRiskWithin(item, 30)).length, "", "expire", "orange", "expiringInstitutions"],
    ["实时监测方案数", schemes.filter((item) => item.type === "实时监测").length, "", "realtime", "blue", "实时监测"],
    ["责任区监测方案数", schemes.filter((item) => item.type === "责任区监测").length, "", "duty", "cyan", "责任区监测"],
    ["深度挖掘方案数", schemes.filter((item) => item.type === "深度挖掘").length, "", "deep", "purple", "深度挖掘"],
    ["信源总数", data.websites.length, "", "media", "orange", "websites"]
  ];
}

function institutionUnitStats() {
  const unitOrder = ["总部费用", "浙江区域", "陕西一区", "四川区域", "湖南区域", "辽宁区域", "北京区域", "上海区域", "广东区域", "港澳区域"];
  const getUnitOrder = (unit) => {
    const index = unitOrder.indexOf(unit);
    return index === -1 ? unitOrder.length : index;
  };
  const unitMap = data.institutions.reduce((map, item) => {
    map.set(item.unit, (map.get(item.unit) || 0) + 1);
    return map;
  }, new Map());
  return Array.from(unitMap, ([unit, count]) => {
    const percent = data.institutions.length ? Math.round((count / data.institutions.length) * 100) : 0;
    return { unit, count, percent };
  })
    .sort((a, b) => b.count - a.count || getUnitOrder(a.unit) - getUnitOrder(b.unit))
    .slice(0, 10);
}

function expiringInstitutionRows() {
  return data.institutions
    .map((item, index) => ({ ...item, sourceIndex: index }))
    .filter((item) => isExpiryRiskWithin(item, 30))
    .sort((a, b) => new Date(a.serviceEnd) - new Date(b.serviceEnd));
}

function renderUnitStats() {
  return institutionUnitStats().map((item) => `
    <div class="unit-stat">
      <div><strong>${item.unit}</strong><span>${item.count} 家机构</span></div>
      <em>${item.percent}%</em>
      <i><b style="width: ${item.percent}%"></b></i>
    </div>
  `).join("");
}

function renderExpiringInstitutionTable() {
  const rows = expiringInstitutionRows();
  if (!rows.length) {
    return `<div class="dashboard-empty">近30天暂无产品到期机构</div>`;
  }
  return `
    <div class="table-wrap dashboard-table-wrap">
      <table class="dashboard-expire-table">
        <thead><tr><th>序号</th><th>机构名称</th><th>统计单元</th><th>机构类型</th><th>到期时间</th><th>到期倒计时</th><th>机构类型</th></tr></thead>
        <tbody>
          ${rows.map((row, index) => {
            const deadline = serviceState(row);
            return `<tr>
              <td>${index + 1}</td>
              <td><span class="link-cell" data-action="homeInstitutionDetail" data-institution-index="${row.sourceIndex}">${row.name}</span></td>
              <td>${row.unit}</td>
              <td>${row.category}</td>
              <td>${row.serviceEnd}</td>
              <td>${deadline.expired ? `<span class="deadline-overdue">${deadline.label}</span>` : deadline.label}</td>
              <td>${tag(row.orgType)}</td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderHome() {
  els.stats.innerHTML = metricCards(homeAnalysisMetrics());
  els.stats.classList.remove("hidden");
  els.stats.classList.add("home-stat-strip");
  els.pageTabs.innerHTML = "";
  els.pageTabs.classList.add("hidden");
  els.queryPanel.classList.add("hidden");
  els.contentSection.classList.add("hidden");
  els.formPage.classList.remove("hidden");
  els.formPage.innerHTML = `
    <section class="dashboard-grid home-dashboard">
      <div class="dashboard-card">
        <h3>各统计单元开通机构TOP10</h3>
        <div class="unit-stat-grid">${renderUnitStats()}</div>
      </div>
      <div class="dashboard-card wide">
        <h3>近30天产品到期机构</h3>
        ${renderExpiringInstitutionTable()}
      </div>
    </section>
  `;
}

function drillDownHomeMetric(type) {
  if (type === "expiringInstitutions") {
    document.querySelector(".dashboard-card.wide")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (["实时监测", "责任区监测", "深度挖掘"].includes(type)) {
    setRoute("schemes");
    state.filters.type = type;
    render();
    return;
  }
  if (type === "websites") {
    setRoute("websites");
    return;
  }
  if (["institutions", "institutionTypes"].includes(type)) setRoute("institutions");
}

function render() {
  const config = routes[state.route];
  const isCountryGroup = state.route === "tags" && state.tagTypeTab === "国家分组";
  if (els.breadcrumb) els.breadcrumb.textContent = config.breadcrumb;
  els.pageTitle.textContent = config.title;
  els.tableTitle.textContent = state.route === "tags" ? `${state.tagTypeTab}列表` : config.tableTitle;
  els.tableSub.textContent = isCountryGroup
    ? "维护国家与国际组织、国家集团的关联关系，供全球眼客户端按国家分组浏览和筛选。"
    : state.route === "institutions"
    ? "机构管理为同步外部机构数据，融媒体管理后台不管理机构（包括：新建机构、编辑机构、删除机构、启用/停用机构等）。"
    : config.tableSub;
  if (state.route === "home") {
    els.toolbar.innerHTML = "";
    renderHome();
    return;
  }
  renderStats();
  renderPageTabs();
  renderFilters();
  renderToolbar();
  renderTable();
}

function renderPageTabs() {
  if (!els.pageTabs) return;
  if (state.route !== "tags") {
    els.pageTabs.innerHTML = "";
    els.pageTabs.classList.add("hidden");
    return;
  }
  const tabs = ["数据标签", "网站标签", "国家分组"];
  els.pageTabs.classList.remove("hidden");
  els.pageTabs.innerHTML = tabs.map((item) => `
    <button class="page-tab ${state.tagTypeTab === item ? "active" : ""}" data-action="switchTagTab" data-tag-type="${item}">
      ${item}
    </button>
  `).join("");
}

function renderStats() {
  els.stats.classList.remove("home-stat-strip");
  const routeMetrics = {
    institutions: institutionMetrics(),
    schemes: schemeMetrics(),
    websites: websiteMetrics()
  };
  const stats = routeMetrics[state.route];
  if (!stats) {
    els.stats.innerHTML = "";
    els.stats.classList.add("hidden");
    return;
  }
  els.stats.classList.remove("hidden");
  els.stats.innerHTML = metricCards(stats);
}

function rangeDateText(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function rangeDateValue(value) {
  return String(value || "").split(" ")[0];
}

function shiftedMonth(year, month, offset) {
  const value = new Date(year, month + offset, 1);
  return { year: value.getFullYear(), month: value.getMonth() };
}

function rangeCalendarDays(year, month, picker) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const gridStart = new Date(year, month, 1 - firstWeekday);
  const today = "2026-07-22";
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const value = rangeDateText(date);
    const classes = [date.getMonth() === month ? "" : "muted"];
    if (value === today) classes.push("today");
    if (value === picker.startDate) classes.push("range-start");
    if (value === picker.endDate) classes.push("range-end");
    if (picker.startDate && picker.endDate && value > picker.startDate && value < picker.endDate) classes.push("in-range");
    return `<button type="button" class="${classes.filter(Boolean).join(" ")}" data-action="selectRangeDate" data-date="${value}">${date.getDate()}</button>`;
  }).join("");
}

function rangeMonthPanel(year, month, side, picker) {
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  const previous = side === "left"
    ? `<button type="button" data-action="navigateRangeMonth" data-offset="-12">«</button><button type="button" data-action="navigateRangeMonth" data-offset="-1">‹</button>`
    : `<span></span><span></span>`;
  const next = side === "right"
    ? `<button type="button" data-action="navigateRangeMonth" data-offset="1">›</button><button type="button" data-action="navigateRangeMonth" data-offset="12">»</button>`
    : `<span></span><span></span>`;
  return `
    <section class="range-month-panel">
      <div class="range-month-head">${previous}<strong>${year} 年 ${month + 1} 月</strong>${next}</div>
      <div class="range-calendar-week">${weekdays.map((day) => `<span>${day}</span>`).join("")}</div>
      <div class="range-calendar-days">${rangeCalendarDays(year, month, picker)}</div>
    </section>`;
}

function rangePickerContent(picker) {
  const rightMonth = shiftedMonth(picker.viewYear, picker.viewMonth, 1);
  const canConfirm = (!picker.startDate && !picker.endDate) || (picker.startDate && picker.endDate);
  return `
    <div class="range-picker-layout">
      <aside class="range-shortcuts">
        <button type="button" data-action="quickRange" data-days="15">近15天</button>
        <button type="button" data-action="quickRange" data-days="30">近30天</button>
        <button type="button" data-action="quickRange" data-days="183">近半年</button>
        <button type="button" data-action="quickRange" data-days="365">近一年</button>
      </aside>
      <div class="range-picker-main">
        <div class="range-picker-values">
          <input value="${picker.startDate}" placeholder="开始日期" readonly />
          <span>›</span>
          <input value="${picker.endDate}" placeholder="结束日期" readonly />
        </div>
        <div class="range-months">
          ${rangeMonthPanel(picker.viewYear, picker.viewMonth, "left", picker)}
          ${rangeMonthPanel(rightMonth.year, rightMonth.month, "right", picker)}
        </div>
      </div>
    </div>
    <footer class="range-picker-footer">
      <button type="button" class="btn text" data-action="clearRange">清空</button>
      <button type="button" class="btn primary" data-action="confirmRange" ${canConfirm ? "" : "disabled"}>确定</button>
    </footer>`;
}

function drawDateRangePicker() {
  const picker = state.dateRangePicker;
  if (!picker) return;
  const popover = document.querySelector(`[data-range-popover="${picker.key}"]`);
  if (!popover) return;
  popover.innerHTML = rangePickerContent(picker);
  popover.classList.remove("hidden");
}

function closeDateRangePicker() {
  document.querySelectorAll(".range-picker-popover").forEach((popover) => popover.classList.add("hidden"));
  state.dateRangePicker = null;
}

function openDateRangePicker(key) {
  const startValue = document.querySelector(`[data-filter="${key}Start"]`)?.value || "";
  const endValue = document.querySelector(`[data-filter="${key}End"]`)?.value || "";
  const startDate = rangeDateValue(startValue);
  const endDate = rangeDateValue(endValue);
  const viewDate = startDate ? new Date(`${startDate}T00:00:00`) : new Date("2026-07-01T00:00:00");
  document.querySelectorAll(".range-picker-popover").forEach((popover) => popover.classList.add("hidden"));
  state.dateRangePicker = {
    key,
    startDate,
    endDate,
    viewYear: viewDate.getFullYear(),
    viewMonth: viewDate.getMonth()
  };
  drawDateRangePicker();
}

function applyQuickRange(days) {
  const picker = state.dateRangePicker;
  if (!picker) return;
  const end = new Date("2026-07-22T00:00:00");
  const start = new Date(end);
  start.setDate(end.getDate() - Number(days) + 1);
  picker.startDate = rangeDateText(start);
  picker.endDate = rangeDateText(end);
  picker.viewYear = start.getFullYear();
  picker.viewMonth = start.getMonth();
  drawDateRangePicker();
}

function confirmDateRange() {
  const picker = state.dateRangePicker;
  if (!picker) return;
  const startInput = document.querySelector(`[data-filter="${picker.key}Start"]`);
  const endInput = document.querySelector(`[data-filter="${picker.key}End"]`);
  if (startInput) startInput.value = picker.startDate;
  if (endInput) endInput.value = picker.endDate;
  closeDateRangePicker();
}

function renderFilters() {
  const config = routes[state.route];
  const filters = state.route === "tags" && state.tagTypeTab === "国家分组"
    ? [
      ["name", "分组名称", "text"],
      ["memberCountry", "成员国家", "select", ["", ...countryOptionList()]],
      ["enabled", "状态", "select", ["", "启用", "停用"]]
    ]
    : config.filters;
  els.filters.innerHTML = filters.map(([key, label, type, options]) => {
    const value = state.filters[key] || "";
    if (type === "dateRange") {
      const startValue = state.filters[`${key}Start`] || "";
      const endValue = state.filters[`${key}End`] || "";
      return `
        <div class="field date-range ${key === "expireAt" ? "align-right" : ""}">
          <label>${label}</label>
          <div class="range-control" data-action="toggleRangePicker" data-range-key="${key}">
            <span class="range-calendar-icon" aria-hidden="true"></span>
            <input data-filter="${key}Start" value="${startValue}" placeholder="开始日期" readonly />
            <em>~</em>
            <input data-filter="${key}End" value="${endValue}" placeholder="结束日期" readonly />
          </div>
          <div class="range-picker-popover hidden" data-range-popover="${key}"></div>
        </div>`;
    }
    if (type === "select") {
      const opts = options.map((item) => `<option value="${item}" ${item === value ? "selected" : ""}>${item || "全部"}</option>`).join("");
      return `<div class="field"><label>${label}</label><select data-filter="${key}">${opts}</select></div>`;
    }
    return `<div class="field"><label>${label}</label><input data-filter="${key}" value="${value}" placeholder="请输入${label}" /></div>`;
  }).join("");
}

function renderToolbar() {
  const createMap = {
    institutions: "新建",
    websites: "新增网址",
    tags: state.tagTypeTab === "国家分组" ? "新增国家分组" : "新增标签"
  };
  els.toolbar.innerHTML = createMap[state.route] ? `<button class="btn primary" data-action="create">${createMap[state.route]}</button>` : "";
}

function renderTable() {
  const config = routes[state.route];
  const isCountryGroup = state.route === "tags" && state.tagTypeTab === "国家分组";
  const columns = isCountryGroup
    ? ["序号", "分组名称", "成员国家数", "排序", "状态", "更新人", "更新时间", "操作"]
    : config.columns;
  const rows = getRows();
  const totalPages = Math.max(1, Math.ceil(rows.length / state.pageSize));
  state.page = Math.min(state.page, totalPages);
  const start = (state.page - 1) * state.pageSize;
  const pageRows = rows.slice(start, start + state.pageSize);
  const table = document.querySelector(".table-wrap table");
  if (table) table.className = isCountryGroup ? "country-groups-table" : `${state.route}-table`;

  els.tableHead.innerHTML = `<tr>${columns.map((column) => `<th>${column}</th>`).join("")}</tr>`;
  els.tableBody.innerHTML = pageRows.map((row, index) => renderRow(row, start + index)).join("");
  els.emptyState.classList.toggle("hidden", rows.length > 0);
  els.totalText.textContent = `共 ${rows.length} 条`;
  els.pageText.textContent = `${state.page} / ${totalPages}`;
  els.jumpPage.value = state.page;
  els.prevPage.disabled = state.page <= 1;
  els.nextPage.disabled = state.page >= totalPages;
}

function renderRow(row, index) {
  if (state.route === "institutions") {
    const deadline = serviceState(row);
    const deleteButton = row.enabled === "停用"
      ? `<button class="btn text danger-text" data-action="deleteInstitution" data-index="${index}">删除</button>`
      : `<button class="btn text muted-text" data-action="deleteInstitutionDisabled" data-index="${index}">删除</button>`;
    return `<tr>
      <td>${index + 1}</td>
      <td>${row.unit}</td>
      <td><span class="link-cell" data-action="detail" data-index="${index}">${row.name}</span></td>
      <td>${tag(row.orgType)}</td>
      <td>${row.sales}</td>
      <td><button class="switch ${row.enabled === "启用" ? "on" : ""}" data-action="toggleInstitution" data-index="${index}" aria-label="${row.enabled}"><span></span>${row.enabled}</button></td>
      <td>${deadline.expired ? tag("已到期") : `<span>${deadline.label}</span>`}</td>
      <td>${servicePeriod(row)}</td>
      <td><div class="action-group"><button class="btn text" data-action="detail" data-index="${index}">详情</button><button class="btn text" data-action="editInstitution" data-index="${index}">编辑</button>${deleteButton}</div></td>
    </tr>`;
  }
  if (state.route === "schemes") {
    const toggleAction = row.status === "运行中" ? "stopScheme" : "startScheme";
    const toggleText = row.status === "运行中" ? "停止" : "启动";
    return `<tr>
      <td>${index + 1}</td>
      <td>${row.unit}</td>
      <td>${row.org}</td>
      <td>${row.name}</td>
      <td>${row.type}</td>
      <td><button class="tag ${statusClass(row.status)} status-action" data-action="${toggleAction}" data-index="${index}" title="点击${toggleText}方案">${row.status}</button></td>
      <td>${formatNumber(row.hits)}</td>
      <td><div class="action-group"><button class="btn text" data-action="schemeData" data-index="${index}">全部数据</button></div></td>
    </tr>`;
  }
  if (state.route === "websites") {
    return `<tr>
      <td>${index + 1}</td>
      <td><span class="link-cell cell-clip media-name" title="${row.name}" data-action="websiteDetail" data-index="${index}">${row.name}</span></td>
      <td>${clipCell(row.url, "website-url")}</td>
      <td>${websiteTagsCell(row, index)}</td>
      <td>${row.type}</td>
      <td>${row.owner}</td>
      <td>${clipCell(row.language, "language-type")}</td>
      <td>${clipCell(row.creator, "creator-name")}</td>
      <td>${row.addedAt}</td>
      <td>${row.parsedAt}</td>
      <td class="number-cell">${formatNumber(row.collectedCount || 0)}</td>
      <td>${tag(websiteParseStatus(row))}</td>
      <td>${row.lastUpdatedAt || ""}</td>
      <td><span class="${row.stale ? "elapsed stale" : "elapsed"}">${row.elapsed || ""}</span></td>
      <td><div class="action-group"><button class="btn text" data-action="visit" data-url="${row.url || "#"}">访问主页</button><button class="btn text" data-action="configureWebsiteTags" data-index="${index}">配置标签</button></div></td>
    </tr>`;
  }
  if (state.route === "logs") {
    return `<tr>
      <td>${index + 1}</td>
      <td>${row.time}</td>
      <td>${row.module}</td>
      <td>${row.action}</td>
      <td>${clipCell(row.target)}</td>
      <td>${clipCell(row.content)}</td>
      <td>${row.operator}</td>
      <td>${row.ip}</td>
      <td>${tag(row.result)}</td>
    </tr>`;
  }
  if (state.route === "tags" && state.tagTypeTab === "国家分组") {
    const memberCount = (row.countries || []).length;
    const nextStatus = row.enabled === "启用" ? "停用" : "启用";
    return `<tr>
      <td>${index + 1}</td>
      <td>${row.name}</td>
      <td>${memberCount}</td>
      <td>${row.sort}</td>
      <td>${tag(row.enabled)}</td>
      <td>${row.updater}</td>
      <td>${row.updated}</td>
      <td><div class="action-group"><button class="btn text" data-action="editCountryGroup" data-index="${index}">编辑</button><button class="btn text" data-action="toggleCountryGroup" data-index="${index}">${nextStatus}</button><button class="btn text ${memberCount > 0 ? "muted-text" : "danger-text"}" data-action="${memberCount > 0 ? "deleteCountryGroupDisabled" : "deleteCountryGroup"}" data-index="${index}">删除</button></div></td>
    </tr>`;
  }
  return `<tr>
    <td>${index + 1}</td>
    <td>${row.name}</td>
    <td>${row.markedCount}</td>
    <td>${row.sort}</td>
    <td>${row.creator}</td>
    <td>${row.updated}</td>
    <td><div class="action-group"><button class="btn text" data-action="editTag" data-index="${index}">编辑</button><button class="btn text ${row.markedCount > 0 ? "muted-text" : "danger-text"}" data-action="${row.markedCount > 0 ? "deleteTagDisabled" : "deleteTag"}" data-index="${index}">删除</button></div></td>
  </tr>`;
}

function collectFilters() {
  state.filters = {};
  document.querySelectorAll("[data-filter]").forEach((input) => {
    state.filters[input.dataset.filter] = input.value.trim();
  });
  state.page = 1;
  renderTable();
}

function rowByFilteredIndex(index) {
  return getRows()[Number(index)];
}

function showDrawer(title, body, footer = `<button class="btn" data-action="closeDrawer">关闭</button>`) {
  els.drawer.innerHTML = `<div class="drawer-header"><h3>${title}</h3><button class="btn text" data-action="closeDrawer">关闭</button></div><div class="drawer-body">${body}</div><div class="drawer-footer">${footer}</div>`;
  els.drawerMask.classList.remove("hidden");
}

function closeDrawer() {
  els.drawerMask.classList.add("hidden");
}

function showModal(title, body, footer, wide = false) {
  els.modal.classList.toggle("wide-modal", wide);
  els.modal.innerHTML = `<div class="modal-header"><h3>${title}</h3><button class="btn text" data-action="closeModal">关闭</button></div><div class="modal-body">${body}</div><div class="modal-footer">${footer}</div>`;
  els.modalMask.classList.remove("hidden");
}

function closeModal() {
  els.modalMask.classList.add("hidden");
  els.modal.classList.remove("wide-modal");
  state.pendingAction = null;
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.remove("hidden");
  window.setTimeout(() => els.toast.classList.add("hidden"), 1800);
}

function institutionDetailContent(row) {
  const deadline = serviceState(row);
  return `
    <div class="detail-group">
      <h3>基本信息</h3>
      <div class="detail-grid">
        <div class="detail-item"><span>统计单元</span><strong>${row.unit}</strong></div>
        <div class="detail-item"><span>机构名称</span><strong>${row.name}</strong></div>
        <div class="detail-item"><span>机构简称</span><strong>${row.shortName}</strong></div>
        <div class="detail-item"><span>机构类型</span><strong>${row.orgType}</strong></div>
        <div class="detail-item"><span>机构类别</span><strong>${row.category}</strong></div>
        <div class="detail-item"><span>销售人员</span><strong>${row.sales}</strong></div>
        <div class="detail-item"><span>销售电话</span><strong>${row.salesPhone}</strong></div>
        <div class="detail-item"><span>到期倒计时</span><strong>${deadline.label}</strong></div>
        <div class="detail-item"><span>服务周期</span><strong>${servicePeriod(row)}</strong></div>
      </div>
    </div>
    ${configPreview(row.config)}
    <div class="detail-group">
      <h3>人员配置</h3>
      ${peopleTable({ compact: true })}
    </div>
  `;
}

function detailDrawer(row) {
  const index = data.institutions.indexOf(row);
  showDrawer(row.name, institutionDetailContent(row), `<button class="btn primary" data-action="editInstitution" data-index="${index}">编辑</button><button class="btn" data-action="closeDrawer">返回列表</button>`);
}

function institutionDetailPage(row) {
  const index = data.institutions.indexOf(row);
  closeDrawer();
  closeModal();
  els.queryPanel.classList.add("hidden");
  els.contentSection.classList.add("hidden");
  els.stats.innerHTML = "";
  els.stats.classList.add("hidden");
  els.formPage.classList.remove("hidden");
  els.pageTitle.textContent = "机构详情";
  els.tableSub.textContent = `查看“${row.name}”的基本信息、配置信息和人员配置。`;
  els.toolbar.innerHTML = "";
  els.formPage.innerHTML = `
    <div class="form-page-card">
      ${institutionDetailContent(row)}
      <div class="form-page-footer">
        <button class="btn" data-action="backInstitutionList">返回列表</button>
        <button class="btn primary" data-action="editInstitution" data-index="${index}">编辑</button>
      </div>
    </div>
  `;
}

function configPreview(config) {
  const normalized = normalizeConfig(config);
  return `
    <div class="detail-group">
      <h3>配置信息</h3>
      <div class="quota-section">
        <h4>方案配置</h4>
        <div class="quota-grid">
          <div><span>实时监测方案数：</span><strong>${formatNumber(normalized.realtimeSchemes)}</strong><em>个</em></div>
          <div><span>开启方案数：</span><strong>${formatNumber(normalized.realtimeOpenSchemes)}</strong><em>个</em></div>
          <div><span>责任区监测方案数：</span><strong>${formatNumber(normalized.dutySchemes)}</strong><em>个</em></div>
          <div><span>开启方案数：</span><strong>${formatNumber(normalized.dutyOpenSchemes)}</strong><em>个</em></div>
          <div><span>方案最大信息量：</span><strong>${formatNumber(normalized.schemeMaxInfo)}</strong><em>条/每天</em></div>
          <div><span>最大导出条数：</span><strong>${formatNumber(normalized.schemeMaxExports)}</strong><em>条/次</em></div>
        </div>
      </div>
      <div class="quota-section">
        <h4>深度挖掘配置</h4>
        <div class="quota-grid">
          <div><span>事件总数：</span><strong>${formatNumber(normalized.eventTotal)}</strong><em>个</em></div>
          <div><span>开启事件总数：</span><strong>${formatNumber(normalized.eventOpenTotal)}</strong><em>个</em></div>
          <div><span>最大导出条数：</span><strong>${formatNumber(normalized.eventMaxExports)}</strong><em>条/次</em></div>
        </div>
      </div>
    </div>`;
}

function institutionModal(row = {}) {
  const isEdit = Boolean(row.name);
  const config = normalizeConfig(row.config);
  closeDrawer();
  closeModal();
  els.queryPanel.classList.add("hidden");
  els.contentSection.classList.add("hidden");
  els.stats.innerHTML = "";
  els.stats.classList.add("hidden");
  els.formPage.classList.remove("hidden");
  els.pageTitle.textContent = isEdit ? "编辑机构" : "新增机构";
  els.tableSub.textContent = isEdit ? "仅可修改机构类型、到期时间和配置信息。" : "新增机构基本信息、人员配置与配置信息。";
  els.toolbar.innerHTML = "";
  els.formPage.innerHTML = `
    <div class="form-page-card">
      <div class="form-section">
        <h3>基本信息</h3>
        <div class="form-grid three-col">
          ${institutionNameControl(row, isEdit)}
          ${readonlyField("机构简称", row.shortName, "institutionShortName")}
          ${readonlyField("机构类别", row.category, "institutionCategory")}
          ${readonlyField("销售人员", row.sales, "institutionSales")}
          ${readonlyField("销售电话", row.salesPhone, "institutionSalesPhone")}
          ${readonlyField("统计单元", row.unit, "institutionUnit")}
          <div class="field"><label class="required">机构类型</label><select><option>${row.orgType || "试用"}</option><option>正式</option><option>试用</option></select></div>
          ${expiryPicker(row.serviceEnd)}
        </div>
      </div>
      <div class="form-section">
        <h3>配置信息</h3>
        ${configFields(config)}
      </div>
      <div class="form-section">
        <h3>人员配置</h3>
        ${peopleTable()}
      </div>
      <div class="form-page-footer">
        <button class="btn" data-action="backInstitutionList">取消</button>
        <button class="btn" data-action="resetInstitutionForm">重置</button>
        <button class="btn primary" data-action="saveInstitutionPage">保存</button>
      </div>
    </div>
  `;
  if (!isEdit) bindInstitutionLookup();
}

function bindInstitutionLookup() {
  const input = document.querySelector("#institutionNameInput");
  if (!input) return;
  const sync = () => {
    const match = data.institutions.find((item) => item.name === input.value.trim());
    const mapping = {
      institutionShortName: match?.shortName || "",
      institutionCategory: match?.category || "",
      institutionSales: match?.sales || "",
      institutionSalesPhone: match?.salesPhone || "",
      institutionUnit: match?.unit || ""
    };
    Object.entries(mapping).forEach(([id, value]) => {
      const target = document.querySelector(`#${id}`);
      if (target) target.value = value;
    });
  };
  input.addEventListener("input", sync);
  input.addEventListener("change", sync);
  sync();
}

function addDaysToCurrent(days) {
  const base = new Date("2026-07-17T00:00:00");
  base.setDate(base.getDate() + Number(days));
  return `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}-${String(base.getDate()).padStart(2, "0")}`;
}

function setExpiryDate(value) {
  const input = document.querySelector("#expiryDateInput");
  const popover = document.querySelector("#expiryDatePopover");
  if (input) input.value = value;
  if (popover) popover.classList.add("hidden");
}

function backInstitutionList() {
  els.formPage.classList.add("hidden");
  els.formPage.innerHTML = "";
  els.queryPanel.classList.remove("hidden");
  els.contentSection.classList.remove("hidden");
  render();
}

function configFields(config) {
  const normalized = normalizeConfig(config);
  const field = (label, value, suffix) => `<div class="quota-input"><label>${label}</label><input type="number" value="${value}" /><span>${suffix}</span></div>`;
  return `
    <div class="config-form">
      <h4>方案配置</h4>
      <div class="quota-grid edit">
        ${field("实时监测方案数：", normalized.realtimeSchemes, "个")}
        ${field("开启方案数：", normalized.realtimeOpenSchemes, "个")}
        ${field("责任区监测方案数：", normalized.dutySchemes, "个")}
        ${field("开启方案数：", normalized.dutyOpenSchemes, "个")}
        ${field("方案最大信息量：", normalized.schemeMaxInfo, "条/每天")}
        ${field("最大导出条数：", normalized.schemeMaxExports, "条/次")}
      </div>
      <h4>深度挖掘配置</h4>
      <div class="quota-grid edit">
        ${field("事件总数：", normalized.eventTotal, "个")}
        ${field("开启事件总数：", normalized.eventOpenTotal, "个")}
        ${field("最大导出条数：", normalized.eventMaxExports, "条/次")}
      </div>
    </div>`;
}

function peopleStatusClass(status) {
  if (status === "已关注已配置") return "configured";
  if (status === "已关注未配置") return "pending";
  return "unfollowed";
}

function peopleAction(person, index, readonly) {
  if (readonly || person.status === "未关注") return "";
  if (person.status === "已关注未配置") {
    return `<button class="btn text" data-action="configurePeople" data-people-index="${index}">配置</button>`;
  }
  return `<button class="btn text" data-action="cancelPeopleAuth" data-people-index="${index}">取消授权</button>`;
}

function nowText() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function refreshPeopleTables() {
  document.querySelectorAll(".people-table-wrap").forEach((wrap) => {
    const compact = wrap.classList.contains("compact");
    const readonly = wrap.dataset.readonly === "true";
    wrap.outerHTML = peopleTable({ compact, readonly });
  });
}

function peopleRoleModal(index) {
  const person = samples.people[index];
  if (!person) return;
  state.peopleRoleIndex = index;
  showModal("配置用户角色", `
    <div class="form-grid single">
      <div class="field">
        <label>微信昵称</label>
        <input value="${person.nick}" disabled />
      </div>
      <div class="field">
        <label class="required">用户角色</label>
        <select id="peopleRoleSelect">
          <option ${person.role === "管理员" ? "selected" : ""}>管理员</option>
          <option ${person.role === "普通用户" ? "selected" : ""}>普通用户</option>
        </select>
      </div>
    </div>
  `, `<button class="btn" data-action="closeModal">取消</button><button class="btn primary" data-action="savePeopleRole">保存</button>`);
}

function peopleTable({ compact = false, readonly = false } = {}) {
  const rows = samples.people.map((person, index) => `
    <tr>
      <td>${index + 1}</td>
      <td><span class="wechat-avatar ${person.avatar}">${person.nick.slice(0, 1).toUpperCase()}</span></td>
      <td>${person.nick}</td>
      <td>${person.name || ""}</td>
      <td>${person.role || ""}</td>
      <td>${person.followedAt || ""}</td>
      <td>${person.configuredAt || ""}</td>
      <td>${person.lastLoginAt || ""}</td>
      <td><span class="follow-status ${peopleStatusClass(person.status)}">${person.status}</span></td>
      <td>${peopleAction(person, index, readonly)}</td>
    </tr>
  `).join("");
  return `
    <div class="people-table-wrap ${compact ? "compact" : ""}" data-readonly="${readonly}">
      <table class="people-table">
        <colgroup>
          <col class="people-col-index" />
          <col class="people-col-avatar" />
          <col class="people-col-nick" />
          <col class="people-col-name" />
          <col class="people-col-role" />
          <col class="people-col-follow" />
          <col class="people-col-config" />
          <col class="people-col-login" />
          <col class="people-col-status" />
          <col class="people-col-action" />
        </colgroup>
        <thead><tr><th>序号</th><th>微信头像</th><th>微信昵称</th><th>姓名</th><th>角色</th><th>关注时间</th><th>配置时间</th><th>最后登录时间</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <footer class="people-pagination"><span>共 ${samples.people.length} 条</span><button class="pager-btn" type="button">上一页</button><button class="pager-btn active-page" type="button">1</button><button class="pager-btn" type="button">下一页</button><select><option>100条/页</option></select><label>前往 <input type="number" value="1" /> 页</label></footer>
    </div>`;
}

function peopleDrawer(row) {
  showDrawer(`${row.name} / 人员配置`, `
    <div class="section-head"><div><h3>人员信息</h3><p>展示微信关注、角色配置与最近登录状态。</p></div><button class="btn primary" data-action="addPeople">新增配置</button></div>
    ${peopleTable()}
  `);
}

function schemeDataContent(row) {
  return `
    <section class="monitor-data-page">
      <div class="monitor-data-head">
        <div>
          <h3>实时监测-数据列表</h3>
          <p>从全球公开信息发现系统同步方案命中数据，保留来源、语种、风险、情感与关键词信息。</p>
        </div>
        <div class="monitor-data-actions">
          <button class="btn primary">导出数据</button>
        </div>
      </div>
      <div class="monitor-filter-grid">
        <div class="field"><label>关键词</label><input placeholder="请输入关键词" /></div>
        <div class="field"><label>媒体环节</label><select><option>全部</option><option>新闻信源</option><option>社交平台</option><option>研究机构</option></select></div>
        <div class="field"><label>情感倾向</label><select><option>全部</option><option>正面</option><option>中性</option><option>负面</option></select></div>
        <div class="field"><label>风险等级</label><select><option>全部</option><option>I级</option><option>II级</option><option>III级</option><option>IV级</option><option>V级</option></select></div>
        <div class="field"><label>发布时间</label><input placeholder="开始时间  ~  结束时间" /></div>
      </div>
      <div class="monitor-data-list">${renderMonitorDataList()}</div>
    </section>
  `;
}

function schemeDataPage(row) {
  closeDrawer();
  closeModal();
  els.queryPanel.classList.add("hidden");
  els.contentSection.classList.add("hidden");
  els.formPage.classList.remove("hidden");
  els.pageTitle.textContent = "方案数据";
  els.tableSub.textContent = `查看“${row.name}”匹配的全部数据。`;
  els.toolbar.innerHTML = "";
  els.formPage.innerHTML = `
    <div class="form-page-card">
      ${schemeDataContent(row)}
      <div class="form-page-footer">
        <button class="btn" data-action="backSchemeList">返回</button>
      </div>
    </div>
  `;
}

function websiteCollectedDataPage(row) {
  closeDrawer();
  closeModal();
  els.queryPanel.classList.add("hidden");
  els.contentSection.classList.add("hidden");
  els.formPage.classList.remove("hidden");
  els.pageTitle.textContent = "已采集数据";
  els.tableSub.textContent = `查看“${row.name}”已采集的数据。`;
  els.toolbar.innerHTML = "";
  els.formPage.innerHTML = `
    <div class="form-page-card">
      <section class="monitor-data-page">
        <div class="monitor-data-head">
          <div>
            <h3>${row.name} - 已采集数据</h3>
            <p>查看该监测网站已解析并采集入库的数据内容。</p>
          </div>
          <div class="monitor-data-actions">
            <button class="btn primary">导出数据</button>
          </div>
        </div>
        <div class="monitor-filter-grid">
          <div class="field"><label>关键词</label><input placeholder="请输入关键词" /></div>
          <div class="field"><label>情感倾向</label><select><option>全部</option><option>正面</option><option>中性</option><option>负面</option></select></div>
          <div class="field"><label>风险等级</label><select><option>全部</option><option>I级</option><option>II级</option><option>III级</option><option>IV级</option><option>V级</option></select></div>
          <div class="field"><label>发布时间</label><input placeholder="开始时间 ~ 结束时间" /></div>
        </div>
        <div class="monitor-data-list">${renderMonitorDataList(row.name)}</div>
      </section>
      <div class="form-page-footer">
        <button class="btn" data-action="backWebsiteList">返回</button>
      </div>
    </div>
  `;
}

function websiteDetailPage(row) {
  const tags = (row.tags || []).length
    ? row.tags.map((name) => `<span class="site-tag-chip">${name}</span>`).join("")
    : `<span class="site-tag-empty">未配置</span>`;
  closeDrawer();
  closeModal();
  els.queryPanel.classList.add("hidden");
  els.contentSection.classList.add("hidden");
  els.stats.innerHTML = "";
  els.stats.classList.add("hidden");
  els.formPage.classList.remove("hidden");
  els.pageTitle.textContent = "网址详情";
  els.tableSub.textContent = `查看“${row.name}”的信源信息与解析状态。`;
  els.toolbar.innerHTML = "";
  els.formPage.innerHTML = `
    <div class="form-page-card">
      <div class="detail-group">
        <h3>基本信息</h3>
        <div class="detail-grid">
          <div class="detail-item"><span>媒体名称</span><strong>${row.name}</strong></div>
          <div class="detail-item"><span>网站地址</span><strong><a class="link-cell" href="${row.url || "#"}" target="_blank" rel="noopener noreferrer">${row.url || "-"}</a></strong></div>
          <div class="detail-item"><span>媒体类型</span><strong>${row.type}</strong></div>
          <div class="detail-item"><span>媒体归属</span><strong>${row.owner}</strong></div>
          <div class="detail-item"><span>语种类型</span><strong>${row.language}</strong></div>
          <div class="detail-item"><span>标签</span><div class="site-tag-list">${tags}</div></div>
        </div>
      </div>
      <div class="detail-group">
        <h3>采集信息</h3>
        <div class="detail-grid">
          <div class="detail-item"><span>采集数据总量</span><strong>${formatNumber(row.collectedCount || 0)}</strong></div>
          <div class="detail-item"><span>解析状态</span><strong>${tag(websiteParseStatus(row))}</strong></div>
          <div class="detail-item"><span>锁定状态</span><strong>${tag(websiteLockStatus(row))}</strong></div>
          <div class="detail-item"><span>添加人</span><strong>${row.creator || "-"}</strong></div>
          <div class="detail-item"><span>添加时间</span><strong>${row.addedAt || "-"}</strong></div>
          <div class="detail-item"><span>解析时间</span><strong>${row.parsedAt || "-"}</strong></div>
          <div class="detail-item"><span>上次更新时间</span><strong>${row.lastUpdatedAt || "-"}</strong></div>
          <div class="detail-item"><span>距上次更新时间</span><strong>${row.elapsed || "-"}</strong></div>
        </div>
      </div>
      <div class="form-page-footer">
        <button class="btn" data-action="backWebsiteList">返回列表</button>
      </div>
    </div>`;
}

function websiteModal(row = {}) {
  showModal(row.name ? "编辑网址" : "新增网址", `
    <div class="form-grid">
      <div class="field"><label>网站ID</label><input value="${row.id || "系统自动生成"}" readonly /></div>
      <div class="field"><label class="required">媒体名称</label><input value="${row.name || ""}" /></div>
      <div class="field full"><label class="required">网站地址</label><input value="${row.url || "https://"}" /></div>
      <div class="field"><label class="required">媒体类型</label><select><option>${row.type || "新闻媒体"}</option><option>机构官网</option><option>社交平台</option><option>论坛社区</option></select></div>
      <div class="field"><label class="required">媒体归属</label><select><option>${row.owner || "美国"}</option><option>中国</option><option>英国</option><option>日本</option><option>泰国</option><option>未知</option></select></div>
      <div class="field"><label class="required">语种类型</label><select><option>${row.language || "英语"}</option><option>中文（简体）</option><option>日语</option><option>泰语</option></select></div>
    </div>
  `, `<button class="btn" data-action="closeModal">取消</button><button class="btn primary" data-action="saveWebsite">保存</button>`);
}

function tagModal(row = {}) {
  state.tagEditIndex = data.tags.indexOf(row);
  const tagType = row.type || state.tagTypeTab;
  showModal(row.name ? "编辑标签" : "新增标签", `
    <div class="form-grid">
      <div class="field"><label class="required">标签类型</label><select id="tagTypeInput"><option ${tagType === "数据标签" ? "selected" : ""}>数据标签</option><option ${tagType === "网站标签" ? "selected" : ""}>网站标签</option></select></div>
      <div class="field"><label class="required">标签名称</label><input id="tagNameInput" value="${row.name || ""}" /></div>
      <div class="field"><label class="required">排序</label><input id="tagSortInput" type="number" value="${row.sort || ""}" /></div>
      <div class="field"><label>标记数据量</label><input value="${row.markedCount ?? 0}" readonly /></div>
      <div class="field"><label>创建人</label><input value="${row.creator || "运营管理员"}" readonly /></div>
    </div>
  `, `<button class="btn" data-action="closeModal">取消</button><button class="btn primary" data-action="saveTag">保存</button>`);
}

function countryGroupModal(row = {}) {
  state.tagEditIndex = data.tags.indexOf(row);
  const selectedCountries = new Set(row.countries || []);
  const countryOptions = countryOptionList().map((country) => `
    <label class="country-option">
      <input class="country-member-option" type="checkbox" value="${country}" ${selectedCountries.has(country) ? "checked" : ""} />
      <span>${country}</span>
    </label>
  `).join("");
  showModal(row.name ? "编辑国家分组" : "新增国家分组", `
    <div class="form-grid">
      <div class="field"><label class="required">分组名称</label><input id="countryGroupNameInput" value="${row.name || ""}" placeholder="请输入分组名称" /></div>
      <div class="field"><label class="required">排序</label><input id="countryGroupSortInput" type="number" min="1" value="${row.sort || ""}" /></div>
      <div class="field"><label>状态</label><select id="countryGroupStatusInput"><option ${row.enabled !== "停用" ? "selected" : ""}>启用</option><option ${row.enabled === "停用" ? "selected" : ""}>停用</option></select></div>
      <div class="field full">
        <label>成员国家</label>
        <div class="country-member-picker">${countryOptions}</div>
        <p class="form-help">一个国家可同时属于多个国家分组。</p>
      </div>
    </div>
  `, `<button class="btn" data-action="closeModal">取消</button><button class="btn primary" data-action="saveCountryGroup">保存</button>`, true);
}

function confirmModal(title, message, callback) {
  state.pendingAction = callback;
  showModal(title, `<p>${message}</p>`, `<button class="btn" data-action="closeModal">取消</button><button class="btn danger" data-action="confirmAction">确认</button>`);
}

document.body.addEventListener("click", (event) => {
  const target = event.target.closest("[data-route], [data-action]");
  if (!target) return;
  const route = target.dataset.route;
  const action = target.dataset.action;
  if (route) setRoute(route);
  if (!action) return;

  const row = target.dataset.index !== undefined ? rowByFilteredIndex(target.dataset.index) : null;
  const currentRows = data[state.route] || [];
  const rowIndex = row ? currentRows.indexOf(row) : -1;
  if (action === "homeMetricDrilldown") {
    drillDownHomeMetric(target.dataset.drilldown);
    return;
  }
  if (action === "backHome") {
    setRoute("home");
    return;
  }
  if (action === "toggleRangePicker") {
    const key = target.dataset.rangeKey;
    const currentPopover = document.querySelector(`[data-range-popover="${key}"]`);
    if (state.dateRangePicker?.key === key && currentPopover && !currentPopover.classList.contains("hidden")) {
      closeDateRangePicker();
    } else {
      openDateRangePicker(key);
    }
    return;
  }
  if (action === "quickRange") {
    applyQuickRange(target.dataset.days);
    return;
  }
  if (action === "navigateRangeMonth" && state.dateRangePicker) {
    const next = shiftedMonth(state.dateRangePicker.viewYear, state.dateRangePicker.viewMonth, Number(target.dataset.offset));
    state.dateRangePicker.viewYear = next.year;
    state.dateRangePicker.viewMonth = next.month;
    drawDateRangePicker();
    return;
  }
  if (action === "selectRangeDate" && state.dateRangePicker) {
    const selectedDate = target.dataset.date;
    if (!state.dateRangePicker.startDate || state.dateRangePicker.endDate) {
      state.dateRangePicker.startDate = selectedDate;
      state.dateRangePicker.endDate = "";
    } else if (selectedDate < state.dateRangePicker.startDate) {
      state.dateRangePicker.endDate = state.dateRangePicker.startDate;
      state.dateRangePicker.startDate = selectedDate;
    } else {
      state.dateRangePicker.endDate = selectedDate;
    }
    drawDateRangePicker();
    return;
  }
  if (action === "clearRange" && state.dateRangePicker) {
    state.dateRangePicker.startDate = "";
    state.dateRangePicker.endDate = "";
    drawDateRangePicker();
    return;
  }
  if (action === "confirmRange") {
    confirmDateRange();
    return;
  }
  if (action === "switchTagTab") {
    state.tagTypeTab = target.dataset.tagType || "数据标签";
    state.filters = {};
    state.page = 1;
    render();
    return;
  }
  if (action === "homeInstitutionDetail") {
    const institution = data.institutions[Number(target.dataset.institutionIndex)];
    if (institution) institutionDetailPage(institution);
    return;
  }
  if (action === "create") {
    const activeRoute = document.querySelector(".nav-item.active")?.dataset.route || state.route;
    if (activeRoute === "institutions") institutionModal({});
    if (activeRoute === "websites") websiteModal();
    if (activeRoute === "tags") {
      if (state.tagTypeTab === "国家分组") countryGroupModal();
      else tagModal();
    }
  }
  if (action === "detail") institutionDetailPage(row);
  if (action === "editInstitution") institutionModal(row || {});
  if (action === "toggleInstitution") {
    const next = row.enabled === "启用" ? "停用" : "启用";
    confirmModal(`${next}机构`, `确认将“${row.name}”${next}？`, () => {
      data.institutions[rowIndex].enabled = next;
      addOperationLog("机构管理", "启用/停用", row.name, `${next}机构服务`);
      render();
      showToast(`机构已${next}`);
    });
  }
  if (action === "deleteInstitution") {
    confirmModal("删除机构", `确认删除已停用机构“${row.name}”？删除后不可恢复。`, () => {
      data.institutions.splice(rowIndex, 1);
      addOperationLog("机构管理", "删除", row.name, "删除已停用机构");
      render();
      showToast("机构已删除");
    });
  }
  if (action === "deleteInstitutionDisabled") showToast("仅已停用机构可以删除");
  if (action === "people") peopleDrawer(row);
  if (action === "configurePeople") peopleRoleModal(Number(target.dataset.peopleIndex));
  if (action === "savePeopleRole") {
    const person = samples.people[state.peopleRoleIndex];
    const role = document.querySelector("#peopleRoleSelect")?.value || "普通用户";
    if (person) {
      person.role = role;
      person.status = "已关注已配置";
      person.configured = true;
      person.configuredAt = nowText();
      closeModal();
      refreshPeopleTables();
      addOperationLog("人员配置", "授权配置", person.nickname, `配置用户角色：${role}`);
      showToast("角色配置已保存");
    }
  }
  if (action === "cancelPeopleAuth") {
    const person = samples.people[Number(target.dataset.peopleIndex)];
    if (person) {
      person.role = "";
      person.status = "已关注未配置";
      person.configured = false;
      person.configuredAt = "";
      refreshPeopleTables();
      addOperationLog("人员配置", "授权配置", person.nickname, "取消用户授权配置");
      showToast("已取消授权");
    }
  }
  if (action === "schemeData") schemeDataPage(row);
  if (action === "startScheme" || action === "stopScheme") {
    const next = action === "startScheme" ? "运行中" : "已暂停";
    data.schemes[rowIndex].status = next;
    addOperationLog("方案统计", "启用/停用", row.name, `${next === "运行中" ? "启动" : "停止"}方案`);
    renderTable();
    showToast(`方案已${next === "运行中" ? "启动" : "停止"}`);
  }
  if (action === "websiteDetail" && row) websiteDetailPage(row);
  if (action === "visit") window.open(target.dataset.url, "_blank", "noopener,noreferrer");
  if (action === "configureWebsiteTags") websiteTagsModal(row);
  if (action === "saveWebsiteTags") {
    const website = data.websites[state.websiteTagIndex];
    if (website) {
      website.tags = Array.from(document.querySelectorAll(".website-tag-option:checked")).map((input) => input.value);
      closeModal();
      addOperationLog("网址大全", "标签配置", website.name, `配置网站标签：${website.tags.join("、") || "未配置"}`);
      renderTable();
      showToast("网站标签已保存");
    }
  }
  if (action === "editWebsite") websiteModal(row);
  if (action === "disableWebsite") confirmModal("停用网址", `确认停用“${row.name}”？`, () => showToast("网址已停用"));
  if (action === "editTag") tagModal(row);
  if (action === "deleteTag") {
    confirmModal("删除标签", `确认删除“${row.name}”？删除后不可恢复。`, () => {
      data.tags.splice(data.tags.indexOf(row), 1);
      addOperationLog("标签管理", "删除", row.name, "删除业务标签");
      renderTable();
      showToast("标签已删除");
    });
  }
  if (action === "deleteTagDisabled") showToast("该标签已有标记数据量，无法删除");
  if (action === "editCountryGroup") countryGroupModal(row);
  if (action === "toggleCountryGroup") {
    const next = row.enabled === "启用" ? "停用" : "启用";
    confirmModal(`${next}国家分组`, `确认${next}“${row.name}”？`, () => {
      row.enabled = next;
      row.updater = "运营管理员";
      row.updated = nowText();
      addOperationLog("标签管理", "启用/停用", row.name, `${next}国家分组`);
      renderTable();
      showToast(`国家分组已${next}`);
    });
  }
  if (action === "deleteCountryGroup") {
    confirmModal("删除国家分组", `确认删除“${row.name}”？删除后不可恢复。`, () => {
      data.tags.splice(data.tags.indexOf(row), 1);
      addOperationLog("标签管理", "删除", row.name, "删除未关联成员国家的国家分组");
      renderTable();
      showToast("国家分组已删除");
    });
  }
  if (action === "deleteCountryGroupDisabled") showToast("该分组已关联成员国家，无法删除，可将分组停用");
  if (action === "toggleExpiryPicker") {
    if (!event.target.closest("#expiryDatePopover")) {
      document.querySelector("#expiryDatePopover")?.classList.toggle("hidden");
    }
  }
  if (action === "quickExpiry") setExpiryDate(addDaysToCurrent(target.dataset.days));
  if (action === "selectExpiryDate" && target.dataset.date) setExpiryDate(target.dataset.date);
  if (action === "backInstitutionList") backInstitutionList();
  if (action === "backSchemeList") backInstitutionList();
  if (action === "backWebsiteList") backInstitutionList();
  if (action === "saveInstitutionPage") { addOperationLog("机构管理", "编辑", "机构信息", "保存机构服务配置"); backInstitutionList(); showToast("机构信息已保存"); }
  if (action === "saveInstitution") { addOperationLog("机构管理", "编辑", "机构信息", "保存机构信息"); closeModal(); showToast("机构信息已保存"); }
  if (action === "resetInstitutionForm") showToast("已恢复默认配置");
  if (action === "saveWebsite") { addOperationLog("网址大全", "新增", "监测网站", "保存网址信息"); closeModal(); showToast("网址信息已保存"); }
  if (action === "saveTag") {
    const tagType = document.querySelector("#tagTypeInput")?.value || "数据标签";
    const tagName = document.querySelector("#tagNameInput")?.value.trim();
    const tagSort = Number(document.querySelector("#tagSortInput")?.value || 0);
    if (!tagName) {
      showToast("请输入标签名称");
      return;
    }
    const payload = { type: tagType, name: tagName, sort: tagSort || data.tags.length + 1, updated: nowText() };
    if (state.tagEditIndex >= 0) {
      Object.assign(data.tags[state.tagEditIndex], payload);
      addOperationLog("标签管理", "编辑", tagName, `编辑${tagType}`);
    } else {
      data.tags.push({ ...payload, markedCount: 0, creator: "运营管理员" });
      addOperationLog("标签管理", "新增", tagName, `新增${tagType}`);
    }
    closeModal();
    renderTable();
    showToast("标签信息已保存");
  }
  if (action === "saveCountryGroup") {
    const groupName = document.querySelector("#countryGroupNameInput")?.value.trim();
    const groupSort = Number(document.querySelector("#countryGroupSortInput")?.value || 0);
    const enabled = document.querySelector("#countryGroupStatusInput")?.value || "启用";
    const countries = Array.from(document.querySelectorAll(".country-member-option:checked")).map((input) => input.value);
    if (!groupName) {
      showToast("请输入分组名称");
      return;
    }
    const payload = {
      type: "国家分组",
      name: groupName,
      countries,
      sort: groupSort || data.tags.filter((item) => item.type === "国家分组").length + 1,
      enabled,
      updater: "运营管理员",
      updated: nowText()
    };
    if (state.tagEditIndex >= 0) {
      Object.assign(data.tags[state.tagEditIndex], payload);
      addOperationLog("标签管理", "编辑", groupName, `编辑国家分组，关联 ${countries.length} 个成员国家`);
    } else {
      data.tags.push(payload);
      addOperationLog("标签管理", "新增", groupName, `新增国家分组，关联 ${countries.length} 个成员国家`);
    }
    closeModal();
    renderTable();
    showToast("国家分组已保存");
  }
  if (action === "confirmAction" && state.pendingAction) { const callback = state.pendingAction; closeModal(); callback(); }
  if (action === "closeDrawer") closeDrawer();
  if (action === "closeModal") closeModal();
});

document.addEventListener("click", (event) => {
  const clickedInsideDateRange = event.composedPath().some((node) => node?.classList?.contains("date-range"));
  if (state.dateRangePicker && !clickedInsideDateRange) closeDateRangePicker();
});

document.querySelector("#searchBtn").addEventListener("click", collectFilters);
document.querySelector("#resetBtn").addEventListener("click", () => {
  state.filters = {};
  state.page = 1;
  render();
});

els.prevPage.addEventListener("click", () => {
  state.page = Math.max(1, state.page - 1);
  renderTable();
});

els.nextPage.addEventListener("click", () => {
  state.page += 1;
  renderTable();
});

els.pageSize.addEventListener("change", () => {
  state.pageSize = Number(els.pageSize.value);
  state.page = 1;
  renderTable();
});

els.jumpPage.addEventListener("change", () => {
  state.page = Math.max(1, Number(els.jumpPage.value || 1));
  renderTable();
});

render();

