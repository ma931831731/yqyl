/**
 * 舆情百战演练平台 · 预设剧本与卡带数据库
 * 包含火灾V6完整五阶段攻防、角色、公信力权重与素材配置
 */

window.DEFAULT_DRILL_CARTRIDGES = [
  {
    id: 'JB-FIRE-20250408',
    name: 'K市P区某居民楼突发火灾爆燃与网络造谣处置演练',
    type: 'fire',
    typeName: '城市火灾安全事故',
    difficulty: 'medium', // easy | medium | hard | hell
    duration: 90,
    startDate: '2026-04-08',
    endDate: '2026-04-09',
    virtualDuration: 90, // 演练真实时长：90分钟
    timeSpeed: 24, // 演练时间倍速：24.0x (真实1小时=1天)
    credibilityBaseline: 100,
    status: 'active', // active (演练中), draft (草稿), disabled (未启用)
    updatedAt: '2026-10-10 11:55',
    creator: '汪艳琼 (特聘教官)',
    coverUrl: './media/cover.png',
    bgUrl: './media/bg.png',
    bgDesc: 'K市P区作为省会城市核心城区，辖区面积98平方公里，常住人口超120万。4月8日18时57分，X街道花园居小区高层住宅突发火灾。该小区建成于2008年，共有居民楼15栋，入住率高达90%，常住人口超过5000人，老弱病残孕多，紧邻地铁站与大型商超。现场23层住宅东侧房间起火爆炸，浓烟滚滚，十余名校服学生惊慌逃离。',
    // 5大推进环节：红蓝完全对应，丰富平铺展示
    stages: [
      {
        id: 'STAGE-01',
        name: '阶段一：初发舆情发现与核实',
        startTime: '2026-04-08 18:57',
        endTime: '2026-04-08 19:30',
        isCrossDay: false,
        timeTag: '04-08 18:57 ~ 19:30',
        summary: '抖音网民“云朵儿”发布爆燃视频引发热炒，网信巡查发现并点点迷信内部调度应急消防核实。',
        selectedBranch: 'branch_a',
        // 环节内严格时序节点展现：一个节点一个发布者，未发布方留空
        confrontations: [
          {
            id: 'CF-101',
            time: '18:57',
            stageId: 'STAGE-01',
            stageName: '阶段一：初发舆情发现与核实',
            red: {
              id: 'RP-101',
              role: '抖音网民“云朵儿”',
              author: '云朵儿',
              avatar: '📱',
              platform: '抖音短视频',
              content: '“P区X街道花园居小区高层突发爆燃事故！” 视频可见浓烟滚滚、房屋烧毁严重，逃生居民中见十余名穿着校服哭泣的学生。(获8000点赞、560条评论)',
              assetId: 'AST-001',
              assetName: '火灾现场实况视频.mp4',
              videoUrl: './media/fire_material_video.mp4',
              penalty: -15,
              trendingPlatform: 'douyin',
              trendingRank: 'Top 1 (爆)'
            },
            blues: [] // 蓝方未发布留空
          },
          {
            id: 'CF-102',
            time: '19:15',
            stageId: 'STAGE-01',
            stageName: '阶段一：初发舆情发现与核实',
            red: null, // 红方未发布留空
            blues: [
              {
                id: 'BM-1A1',
                role: '市委网信办监测专班',
                author: '网信指挥席',
                avatar: '👑',
                category: 'diandian_dispatch',
                platform: '点点密信内部指令',
                title: '【点点密信指令】调度应急消防30分钟内核实现场伤亡',
                statement: '【点点密信内部督导】@区应急管理局 @区消防救援大队：网络监测到花园居突发爆燃舆情，请30分钟内紧急报送初核火情、现场伤亡及首批搜救力量！',
                branchName: '走向 1-A (协同高效核实)',
                docAssetId: '',
                delta: 10,
                trendingPlatform: '',
                trendingRank: ''
              }
            ]
          },
          {
            id: 'CF-103',
            time: '19:25',
            stageId: 'STAGE-01',
            stageName: '阶段一：初发舆情发现与核实',
            red: null, // 红方未发布留空
            blues: [
              {
                id: 'BM-1A2',
                role: '区应急管理局指挥调度席',
                author: '应急指挥席',
                avatar: '🛡️',
                category: 'field_operation',
                platform: '官方现场应急处置',
                title: '【前线应急处置】疏散现场人员与设立警戒区，120名消防官兵展开内攻',
                statement: '【前线处置情况】区应急管理局现场疏散转移受灾群众286人，设立外围安全警戒线，区消防8台高喷车展开内攻灭火，暂无人员死亡汇报。',
                branchName: '走向 1-A (首战协同闭环)',
                docAssetId: '',
                delta: 10,
                trendingPlatform: 'weibo',
                trendingRank: '同城榜首'
              }
            ]
          },
          {
            id: 'CF-104',
            time: '19:30',
            stageId: 'STAGE-01',
            stageName: '阶段一：初发舆情发现与核实',
            red: {
              id: 'RP-102',
              role: '现场聚集围观群众',
              author: '现场围观群众',
              avatar: '👥',
              platform: '快手平台 / 微信群',
              content: '“现场火势窜起十几米高，警报声响成一片，有人在窗边挥白毛巾求救！” (多群转发数百次，现场恐慌情绪蔓延)',
              assetId: '',
              assetName: '',
              penalty: -10,
              trendingPlatform: 'kuaishou',
              trendingRank: 'Top 3 (沸)'
            },
            blues: [] // 蓝方未发布留空
          }
        ],
        redCamp: {
          roles: [
            { id: 'R1-1', name: '抖音爆料网民“云朵儿”', active: true },
            { id: 'R1-2', name: '现场聚集围观群众', active: true },
            { id: 'R1-3', name: '逃生获救居民群体', active: false }
          ],
          posts: [
            {
              id: 'RP-101',
              role: '抖音网民“云朵儿”',
              author: '抖音网民“云朵儿”',
              platform: '抖音短视频',
              type: '现场爆料',
              penalty: -15,
              content: '“P区X街道花园居小区高层突发爆燃事故！” 视频可见浓烟滚滚、房屋烧毁严重，逃生居民中见十余名穿着校服哭泣的学生。(获8000点赞、560条评论)',
              assetId: 'AST-001',
              assetName: '火灾现场实况视频 (MP4)',
              trendingPlatform: 'douyin',
              trendingRank: 'Top 1 (爆)'
            },
            {
              id: 'RP-102',
              role: '现场聚集围观群众',
              author: '现场围观群众',
              platform: '快手平台 / 微信群',
              type: '恐慌发酵',
              penalty: -10,
              content: '“现场火势窜起十几米高，警报声响成一片，有人在窗边挥白毛巾求救！” (多群转发数百次，现场恐慌情绪蔓延)',
              assetId: '',
              trendingPlatform: 'kuaishou',
              trendingRank: 'Top 3 (沸)'
            }
          ],
          assets: ['AST-001']
        },
        blueCamp: {
          roles: [
            { id: 'B1-1', name: '市委网信办监测专班', active: true },
            { id: 'B1-2', name: '区应急管理局指挥调度席', active: true },
            { id: 'B1-3', name: '区消防救援大队', active: true },
            { id: 'B1-4', name: 'X街道办事处安监组', active: true }
          ],
          measures: [
            {
              id: 'BM-1A1',
              role: '市委网信办监测专班',
              category: 'diandian_dispatch',
              targetUnit: '区应急管理局、区消防救援大队',
              branchKey: 'positive_a',
              title: '【点点密信指令】调度区应急局与消防大队30分钟内核实现场与伤亡',
              type: 'positive',
              delta: 10,
              branchName: '走向 1-A (协同高效核实)',
              desc: '通过点点密信协同指令平台，要求应急与消防30分钟内精准报送现场火势、伤亡人数及出动力量。',
              statement: '【点点密信内部督导】@区应急管理局 @区消防救援大队：网络监测到花园居突发爆燃舆情，请30分钟内紧急报送初核火情、现场伤亡及首批搜救力量！',
              trendingPlatform: '',
              trendingRank: ''
            },
            {
              id: 'BM-1A2',
              role: '区应急管理局指挥调度席',
              category: 'field_operation',
              targetUnit: '市委网信办',
              branchKey: 'positive_a',
              title: '【前线应急处置】疏散现场人员与设立警戒区，120名消防官兵展开内攻',
              type: 'positive',
              delta: 10,
              branchName: '走向 1-A (首战协同闭环)',
              desc: '区应急指挥席迅速疏散现场受灾人员与设立外围警戒线，并跟报120名官兵内攻无伤亡情况。',
              statement: '【前线处置情况】区应急管理局现场疏散转移受灾群众286人，设立外围安全警戒线，区消防8台高喷车展开内攻灭火，暂无人员死亡汇报。',
              trendingPlatform: 'weibo',
              trendingRank: '同城榜首'
            },
            {
              id: 'BM-1B',
              role: '区应急管理局指挥调度席',
              category: 'field_operation',
              branchKey: 'negative_b',
              title: '措施 1-B：以非本管辖推诿扯皮，超1小时未回应',
              type: 'negative',
              delta: -15,
              branchName: '走向 1-B (失当迟滞失控)',
              desc: '部门间沟通迟缓，以“非本管辖”推诿扯皮，现场未划定警戒线，任由围观群众靠近拍摄并二次堵塞道路。',
              statement: '【失当推诿走向】部门间沟通迟缓，以“非本管辖权属”推诿扯皮，迟迟未划定警戒线疏散人群，任由群众围观拍摄，处置响应拖延超1小时。',
              trendingPlatform: '',
              trendingRank: ''
            }
          ],
          statements: ['公文：关于启动城市火灾应急响应指挥预案的批示']
        }
      },
      {
        id: 'STAGE-02',
        name: '阶段二：现场受阻与初次通报',
        startTime: '2026-04-08 19:30',
        endTime: '2026-04-08 21:30',
        isCrossDay: false,
        timeTag: '04-08 19:30 ~ 21:30',
        summary: '消防通道违停受阻、记者越界突发采访争端，21时明火扑灭并选用模版对外发布第一期火灾搜救通报。',
        selectedBranch: 'branch_a',
        confrontations: [
          {
            id: 'CF-201',
            time: '19:45',
            stageId: 'STAGE-02',
            stageName: '阶段二：现场受阻与初次通报',
            red: {
              id: 'RP-201',
              role: '涉事小区业主代表',
              author: '业主代表',
              avatar: '🏢',
              platform: '新浪微博 / 微信群',
              content: '小区消防通道被多辆私家车严重堵塞，消防车被堵在门外进不去！现场一度混乱，#消防通道变死亡通道#引发众怒！',
              assetId: 'AST-002',
              assetName: '消防通道堵死现场监控照片 (JPG)',
              imgUrl: './media/cover.png',
              penalty: -15,
              trendingPlatform: 'weibo',
              trendingRank: 'Top 3 (#消防通道变死亡通道#)'
            },
            blues: [] // 蓝方未发布留空
          },
          {
            id: 'CF-202',
            time: '20:10',
            stageId: 'STAGE-02',
            stageName: '阶段二：现场受阻与初次通报',
            red: null, // 红方未发布留空
            blues: [
              {
                id: 'BM-2A1',
                role: '消防现场指挥部 & 交警排障组',
                author: '消防交警联勤',
                avatar: '🚒',
                category: 'field_operation',
                platform: '消防交警联勤处置',
                title: '破拆违停私家车开辟救援通道 + 纪检监察倒查涉事物业安全责任',
                statement: '【排障指令】交警与消防联勤联动，依法对违停阻碍救援车辆强行破拆移位，确保供水登高通道畅通。',
                branchName: '走向 2-A (攻克救援堵点)',
                docAssetId: '',
                delta: 10,
                trendingPlatform: '',
                trendingRank: ''
              }
            ]
          },
          {
            id: 'CF-203',
            time: '20:30',
            stageId: 'STAGE-02',
            stageName: '阶段二：现场受阻与初次通报',
            red: {
              id: 'RP-202',
              role: '《红星新闻》驻市记者团队',
              author: '红星新闻直播团队',
              avatar: '📹',
              platform: '快手直播 / 微信公众号',
              content: '记者越过警戒线进行现场直播，以“警戒线标注不明”拒绝离开，疑似与现场个别安保发生争夺摄像设备，全网声讨采访遇阻！',
              assetId: 'AST-004',
              assetName: '《采访遇阻》文章扫描件 (PDF)',
              penalty: -15,
              trendingPlatform: 'toutiao',
              trendingRank: 'Top 2 (热)'
            },
            blues: [] // 蓝方未发布留空
          },
          {
            id: 'CF-204',
            time: '20:45',
            stageId: 'STAGE-02',
            stageName: '阶段二：现场受阻与初次通报',
            red: null, // 红方未发布留空
            blues: [
              {
                id: 'BM-2A2',
                role: '宣传部媒体协调组',
                author: '媒体协调专员',
                avatar: '📢',
                category: 'media_interview',
                platform: '宣传部媒体协调',
                title: '【突发采访应对】引导记者至安全采访区，现场回应搜救进度保障知情权',
                statement: '【突发采访回应】“感谢媒体监督，现场正在进行高空内攻救援，请记者朋友随同转入安全发布区，我们每半小时通报搜救进展。”',
                branchName: '走向 2-A1 (善待媒体善用媒体)',
                docAssetId: '',
                delta: 10,
                trendingPlatform: '',
                trendingRank: ''
              }
            ]
          },
          {
            id: 'CF-205',
            time: '21:00',
            stageId: 'STAGE-02',
            stageName: '阶段二：现场受阻与初次通报',
            red: null, // 红方未发布留空
            blues: [
              {
                id: 'BM-2A3',
                role: '联合调查组新闻发言人',
                author: '官方新闻发言人',
                avatar: '🏛️',
                category: 'official_notice',
                platform: '新浪微博权威通报',
                templateId: 'AST-DOC-01',
                docAssetId: 'AST-DOC-01',
                title: '【官方通报发布】选用模版《火灾搜救与基本情况通报》(附件一) 权威发布',
                statement: '【第一期搜救通报】截至21时明火完全扑灭，共疏散286人，搜救出伤员21人，4人不幸遇难。联合调查组已成立。',
                branchName: '走向 2-A2 (抢占事实首发权)',
                delta: 15,
                trendingPlatform: 'weibo',
                trendingRank: 'Top 1 (权威置顶)'
              }
            ]
          }
        ],
        redCamp: {
          roles: [
            { id: 'R2-1', name: '《红星新闻》驻市记者团队', active: true },
            { id: 'R2-2', name: '涉事小区业主代表', active: true },
            { id: 'R2-3', name: '涉事花园居物业人员', active: false }
          ],
          posts: [
            {
              id: 'RP-201',
              role: '涉事小区业主代表',
              author: '现场网民发帖',
              platform: '微博 / 抖音',
              type: '舆情发酵',
              penalty: -15,
              content: '小区消防通道被多辆私家车严重堵塞，消防车被堵在门外进不去！现场一度混乱，#消防通道变死亡通道#引发众怒！',
              assetId: 'AST-002',
              trendingPlatform: 'weibo',
              trendingRank: 'Top 3'
            },
            {
              id: 'RP-202',
              role: '《红星新闻》驻市记者团队',
              author: '红星新闻直播团队',
              platform: '快手直播 / 微信公众号',
              type: '媒体冲突',
              penalty: -15,
              content: '记者越过警戒线进行现场直播，以“警戒线标注不明”拒绝离开，疑似与现场安保发生争夺摄像设备。',
              assetId: 'AST-004',
              trendingPlatform: 'toutiao',
              trendingRank: 'Top 2'
            }
          ],
          assets: ['AST-002', 'AST-004']
        },
        blueCamp: {
          roles: [
            { id: 'B2-1', name: '消防现场指挥官', active: true },
            { id: 'B2-2', name: '交警排障疏导席', active: true },
            { id: 'B2-3', name: '现场安保秩序维稳组', active: true },
            { id: 'B2-4', name: '宣传部媒体沟通组', active: true }
          ],
          measures: [
            {
              id: 'BM-2A2',
              role: '宣传部媒体沟通组',
              category: 'media_interview',
              branchKey: 'positive_a',
              title: '【突发采访应对】引导记者至安全专区，现场回应搜救进度保障知情权',
              type: 'positive',
              delta: 10,
              branchName: '走向 2-A1 (善待媒体善用媒体)',
              desc: '现场安保与宣传专员设立媒体采访引导专线，每30分钟发布最新救援进度，平息记者对立情绪。',
              statement: '【突发采访回应】“感谢媒体监督，现场正在进行高空内攻救援，请记者朋友随同转入安全发布区，我们每半小时通报搜救进展。”',
              trendingPlatform: '',
              trendingRank: ''
            },
            {
              id: 'BM-2A3',
              role: '联合调查组新闻发言人',
              category: 'official_notice',
              templateId: 'AST-DOC-01',
              docAssetId: 'AST-DOC-01',
              branchKey: 'positive_a',
              title: '【官方通报发布】选用模版《火灾搜救与基本情况通报》(附件一) 权威发布',
              type: 'positive',
              delta: 15,
              branchName: '走向 2-A2 (抢占事实首发权)',
              desc: '搜救结束30分钟内发布第一期通报，公布扑救历程、伤亡21人遇难4人真实数字，抢占事实首发权。',
              statement: '【情况通报】截至4月8日21时，花园居小区火灾明火完全扑灭，共疏散居民286人，搜救出伤员21人，4人不幸遇难。联合调查组已成立。',
              trendingPlatform: 'weibo',
              trendingRank: 'Top 1 (权威置顶)'
            },
            {
              id: 'BM-2B',
              role: '现场处置组',
              category: 'field_operation',
              branchKey: 'negative_b',
              title: '措施 2-B：安保粗暴夺抢记者摄像机 + 封锁消息瞒报为“无重大伤亡”',
              type: 'negative',
              delta: -25,
              branchName: '走向 2-B (媒体声讨舆情引爆)',
              desc: '粗暴推搡记者并夺抢设备，引发全国新闻界声讨《采访遇阻》；通报拖延至次日且死伤数字含糊其辞。',
              statement: '',
              trendingPlatform: '',
              trendingRank: ''
            }
          ],
          statements: ['第一期《关于P区花园居小区火灾搜救与基本情况通报》']
        }
      },
      {
        id: 'STAGE-03',
        name: '阶段三：家属情绪与次生舆情',
        startTime: '2026-04-08 21:30',
        endTime: '2026-04-09 07:00',
        isCrossDay: true,
        timeTag: '🌙 跨天 04-08 21:30 ~ 04-09 07:00',
        summary: '遇难家属围堵要说法，衍生移花接木便衣抓家属、补课黑产业链、物业空消火栓箱热搜，跨夜联合专班分类拆解。',
        selectedBranch: 'branch_a',
        confrontations: [
          {
            id: 'CF-301',
            date: '04-08',
            time: '21:30',
            stageId: 'STAGE-03',
            stageName: '阶段三：家属情绪与次生舆情',
            red: {
              id: 'RP-301',
              role: '快手自媒体“@直击K市现场”',
              author: '直击K市现场',
              avatar: '📱',
              platform: '快手短视频',
              content: '移花接木其它事件视频声称：“维权家属被便衣警察押上黑车，政府镇压！” 恶意渲染警民冲突。(引发跨群热议)',
              assetId: '',
              assetName: '',
              penalty: -20,
              trendingPlatform: 'kuaishou',
              trendingRank: 'Top 2 (热)'
            },
            blues: [] // 蓝方未发布留空
          },
          {
            id: 'CF-302',
            date: '04-08',
            time: '22:15',
            stageId: 'STAGE-03',
            stageName: '阶段三：家属情绪与次生舆情',
            red: null, // 红方未发布留空
            blues: [
              {
                id: 'BM-3A1',
                role: '联合善后专班 (街道+卫健)',
                author: '善后关怀专班',
                avatar: '❤️',
                category: 'diandian_dispatch',
                platform: '点点密信督导协同',
                title: '【点点密信内部督导】一户一专班连夜入驻医院，真诚倾听家属诉求',
                statement: '【点点密信督导】街道与卫健联合抽调24人组建4个关怀组，一对一帮扶遇难和重伤者家庭，开辟医疗心理双通道。',
                branchName: '走向 3-A1 (温情救济化解矛盾)',
                docAssetId: '',
                delta: 15,
                trendingPlatform: '',
                trendingRank: ''
              }
            ]
          },
          {
            id: 'CF-303',
            date: '04-08',
            time: '23:00',
            stageId: 'STAGE-03',
            stageName: '阶段三：家属情绪与次生舆情',
            red: {
              id: 'RP-302',
              role: '微博组织“@正义家长联盟”',
              author: '正义家长联盟',
              avatar: '🎓',
              platform: '微博同城话题',
              content: '“育才中学学生火灾中逃生！教育局明面取消晚自习暗地纵容居民楼补课！拿孩子命换升学率？#补课黑产业链#” (转发4.1万)',
              assetId: '',
              assetName: '',
              penalty: -15,
              trendingPlatform: 'weibo',
              trendingRank: 'Top 4 (#补课黑产业链#)'
            },
            blues: [] // 蓝方未发布留空
          },
          {
            id: 'CF-304',
            date: '04-09',
            time: '01:30',
            stageId: 'STAGE-03',
            stageName: '阶段三：家属情绪与次生舆情',
            red: null, // 红方未发布留空
            blues: [
              {
                id: 'BM-3A2',
                role: '区教育局核查专班',
                author: '教育局联合调查组',
                avatar: '🏫',
                category: 'official_notice',
                platform: '官方微博通报',
                title: '【教育核查通报】连夜联合摸排租住房源，澄清起火住户为普通陪读家庭',
                statement: '【教育核查通报】经深入核查，起火单元为两户普通租住家庭，未开设辅导机构，逃生学生为同小区结伴复习，谣言不实。',
                branchName: '走向 3-A2 (快速核查阻断黑产炒作)',
                docAssetId: '',
                delta: 10,
                trendingPlatform: 'weibo',
                trendingRank: '热搜澄清'
              }
            ]
          },
          {
            id: 'CF-305',
            date: '04-09',
            time: '03:20',
            stageId: 'STAGE-03',
            stageName: '阶段三：家属情绪与次生舆情',
            red: {
              id: 'RP-303',
              role: '业主群维权爆料网民',
              author: '业主爆料网民',
              avatar: '🏢',
              platform: '小红书 / 微信群',
              content: '“去年消防检查合格是物业伪造签字！消火栓箱里根本没有水枪水带！XX物业谋杀业主！” (附空消火栓箱照片)',
              assetId: 'AST-003',
              assetName: '空消火栓箱与伪造签字图 (PNG)',
              imgUrl: './media/cover.png',
              penalty: -15,
              trendingPlatform: 'douyin',
              trendingRank: 'Top 5'
            },
            blues: [] // 蓝方未发布留空
          },
          {
            id: 'CF-306',
            date: '04-09',
            time: '05:40',
            stageId: 'STAGE-03',
            stageName: '阶段三：家属情绪与次生舆情',
            red: null, // 红方未发布留空
            blues: [
              {
                id: 'BM-3A3',
                role: '区住建局与消防执法科',
                author: '住建与执法科',
                avatar: '⚖️',
                category: 'field_operation',
                platform: '今日头条权威通报',
                title: '【立案通报】查封涉事物业历年消防台账 + 纪检监察倒查维保虚假签字',
                statement: '【立案通报】住建与消防执法部门已查封物业公司消防安全维保档案，涉嫌虚假签字问题已移交纪检监察部门立案查处。',
                branchName: '走向 3-A3 (铁腕执法平息众怒)',
                docAssetId: '',
                delta: 15,
                trendingPlatform: 'toutiao',
                trendingRank: 'Top 3 (权威发布)'
              }
            ]
          }
        ],
        redCamp: {
          roles: [
            { id: 'R3-1', name: '遇难及重伤者家属代表', active: true },
            { id: 'R3-2', name: '快手自媒体“@直击K市现场”', active: true },
            { id: 'R3-3', name: '微博组织“@正义家长联盟”', active: true },
            { id: 'R3-4', name: '百万大V“@顽皮的郭贝勒”', active: true }
          ],
          posts: [
            {
              id: 'RP-301',
              role: '快手自媒体“@直击K市现场”',
              author: '快手“@直击K市现场”',
              platform: '快手平台',
              type: '移花接木造谣',
              penalty: -20,
              content: '移花接木其它事件视频声称：“维权家属被便衣警察押上黑车，政府镇压！” 恶意渲染警民冲突。',
              trendingPlatform: 'kuaishou',
              trendingRank: 'Top 2'
            },
            {
              id: 'RP-302',
              role: '微博组织“@正义家长联盟”',
              author: '“@正义家长联盟”',
              platform: '微博同城话题',
              type: '衍生黑产炒作',
              penalty: -15,
              content: '“育才中学学生火灾中逃生！教育局明面取消晚自习暗地纵容居民楼补课！拿孩子命换升学率？#补课黑产业链#” (转发4.1万)',
              trendingPlatform: 'weibo',
              trendingRank: 'Top 4'
            },
            {
              id: 'RP-303',
              role: '遇难及重伤者家属代表',
              author: '业主群疯传网民',
              platform: '小红书 / 微信',
              type: '声讨物业',
              penalty: -15,
              content: '“去年消防检查合格是物业伪造签字！消火栓箱里根本没有水枪水带！XX物业谋杀业主！”',
              assetId: 'AST-003',
              trendingPlatform: 'douyin',
              trendingRank: 'Top 5'
            }
          ],
          assets: ['AST-003']
        },
        blueCamp: {
          roles: [
            { id: 'B3-1', name: '联合善后专班 (街道+卫健)', active: true },
            { id: 'B3-2', name: '区公安分局治安与网安大队', active: true },
            { id: 'B3-3', name: '区教育局核查专班', active: true },
            { id: 'B3-4', name: '住建与消防执法科', active: true }
          ],
          measures: [
            {
              id: 'BM-3A1',
              role: '联合善后专班 (街道+卫健)',
              category: 'diandian_dispatch',
              branchKey: 'positive_a',
              title: '【点点迷信内部督导】一户一专班连夜入驻医院，真诚倾听家属诉求',
              type: 'positive',
              delta: 15,
              branchName: '走向 3-A1 (温情救济化解矛盾)',
              desc: '由区领导带队，街道、民政、心理专家组成专属关怀组，一对一帮扶遇难和重伤者家庭。',
              statement: '【点点迷信督导】街道与卫健联合抽调24人组建4个关怀组，一对一帮扶遇难和重伤者家庭，开辟医疗心理双通道。',
              trendingPlatform: '',
              trendingRank: ''
            },
            {
              id: 'BM-3A2',
              role: '区教育局核查专班',
              category: 'official_notice',
              branchKey: 'positive_a',
              title: '【教育核查通报】连夜联合摸排租住房源，澄清起火住户为普通陪读家庭',
              type: 'positive',
              delta: 10,
              branchName: '走向 3-A2 (快速核查阻断黑产炒作)',
              desc: '针对网传“居民楼非法补课”，连夜走访学校与住户，证实起火住户系两户普通租客，非培训机构。',
              statement: '【教育核查通报】经深入核查，起火单元为两户普通租住家庭，未开设辅导机构，逃生学生为同小区结伴复习，谣言不实。',
              trendingPlatform: 'weibo',
              trendingRank: '热搜澄清'
            },
            {
              id: 'BM-3B',
              role: '区公安分局',
              category: 'field_operation',
              branchKey: 'negative_b',
              title: '措施 3-B：公安出动防暴力量驱散哭闹家属 + 教育局推诿回避 + 封群删帖',
              type: 'negative',
              delta: -30,
              branchName: '走向 3-B (矛盾激化境外介入)',
              desc: '强力手段压制家属情绪，各部门默不作声，被扣上“掩盖黑产、镇压百姓”恶名，境外媒体介入造谣。',
              statement: '',
              trendingPlatform: '',
              trendingRank: ''
            }
          ],
          statements: ['教育局核查通报', '住建局对涉事物业立案调查通告']
        }
      },
      {
        id: 'STAGE-04',
        name: '阶段四：恶性造谣与辟谣执法',
        startTime: '2026-04-09 07:00',
        endTime: '2026-04-09 12:00',
        isCrossDay: false,
        timeTag: '04-09 07:00 ~ 12:00',
        summary: '网络造谣“抬了20多个担架”、“据说死了50人”，点点迷信协同溯源，公安选用警情通报模版依法拘留造谣者。',
        selectedBranch: 'branch_a',
        confrontations: [
          {
            id: 'CF-401',
            time: '07:15',
            stageId: 'STAGE-04',
            stageName: '阶段四：恶性造谣与辟谣执法',
            red: {
              id: 'RP-401',
              role: '抖音造谣网民“小飞飞”',
              author: '小飞飞 (张某)',
              avatar: '🚨',
              platform: '潇湘晨报评论区',
              content: '“我就在对面小区住，亲眼看到来了好多消防员，担架都抬了二十多个，应该死了不少人！” (获点赞6820条)',
              assetId: '',
              assetName: '',
              penalty: -15,
              trendingPlatform: 'douyin',
              trendingRank: 'Top 2 (热)'
            },
            blues: [] // 蓝方未发布留空
          },
          {
            id: 'CF-402',
            time: '08:00',
            stageId: 'STAGE-04',
            stageName: '阶段四：恶性造谣与辟谣执法',
            red: null, // 红方未发布留空
            blues: [
              {
                id: 'BM-4A1',
                role: '市委网信辟谣专班',
                author: '网信辟谣专班',
                avatar: '👑',
                category: 'diandian_dispatch',
                platform: '点点密信内部指令',
                title: '【点点密信指令】指令公安网安锁定“小飞飞”账号IP与真实身份',
                statement: '【点点密信指令】@区公安分局网安大队：请立即对抖音造谣账号“小飞飞”进行溯源落地，锁定造谣者现住址！',
                branchName: '走向 4-A1 (技术溯源锁定)',
                docAssetId: '',
                delta: 10,
                trendingPlatform: '',
                trendingRank: ''
              }
            ]
          },
          {
            id: 'CF-403',
            time: '08:45',
            stageId: 'STAGE-04',
            stageName: '阶段四：恶性造谣与辟谣执法',
            red: {
              id: 'RP-402',
              role: '微博造谣大V“花花的世界”',
              author: '花花的世界 (李某)',
              avatar: '⚡',
              platform: '新浪微博大V评论区',
              content: '“一直听到爆炸声，据说死了50人！” (获点赞13941，回复4328条，恐慌跨平台裂变扩散)',
              assetId: '',
              assetName: '',
              penalty: -20,
              trendingPlatform: 'weibo',
              trendingRank: 'Top 1 (爆)'
            },
            blues: [] // 蓝方未发布留空
          },
          {
            id: 'CF-404',
            time: '09:30',
            stageId: 'STAGE-04',
            stageName: '阶段四：恶性造谣与辟谣执法',
            red: null, // 红方未发布留空
            blues: [
              {
                id: 'BM-4A2',
                role: 'K市公安局P区分局 (网安/治安)',
                author: '公安网安支队',
                avatar: '👮',
                category: 'official_notice',
                platform: '官方抖音警情通报',
                templateId: 'AST-DOC-02',
                docAssetId: 'AST-DOC-02',
                title: '【官方通报发布】选用模版《K市公安局P区分局警情通报》(附件二) 拘留张某10日',
                statement: '【警情通报】经查，网民“小飞飞”（张某，男，32岁）编造散布“担架抬了二十多”虚假谣言，公安机关依法予以行政拘留10日。',
                branchName: '走向 4-A2 (雷霆打击铁证辟谣)',
                delta: 20,
                trendingPlatform: 'douyin',
                trendingRank: 'Top 1 (辟谣声明)'
              }
            ]
          },
          {
            id: 'CF-405',
            time: '10:15',
            stageId: 'STAGE-04',
            stageName: '阶段四：恶性造谣与辟谣执法',
            red: null, // 红方未发布留空
            blues: [
              {
                id: 'BM-4A3',
                role: 'K市公安局P区分局 & 市卫健委',
                author: '公安与卫健委联合通报',
                avatar: '🏥',
                category: 'official_notice',
                platform: '官方微博警情通报',
                templateId: 'AST-DOC-02',
                docAssetId: 'AST-DOC-02',
                title: '【官方通报发布】公布定点收治医院真实花名册，依法行政拘留李某10日',
                statement: '【警情通报】违法嫌疑人李某故意编造传播“据说死了50人”虚假谣言，已被依法行政拘留10日。网络不是法外之地！市卫健委公布定点医院真实收治花名册。',
                branchName: '走向 4-A3 (粉碎恐慌阻断裂变)',
                delta: 20,
                trendingPlatform: 'weibo',
                trendingRank: 'Top 1 (辟谣声明)'
              }
            ]
          }
        ],
        redCamp: {
          roles: [
            { id: 'R4-1', name: '抖音造谣网民“小飞飞”', active: true },
            { id: 'R4-2', name: '微博造谣大V“花花的世界”', active: true },
            { id: 'R4-3', name: '自媒体“K市小马哥”', active: true }
          ],
          posts: [
            {
              id: 'RP-401',
              role: '抖音造谣网民“小飞飞”',
              author: '抖音“小飞飞” (张某)',
              platform: '潇湘晨报评论区',
              type: '恶性造谣',
              penalty: -15,
              content: '“我就在对面小区住，亲眼看到来了好多消防员，担架都抬了二十多个，应该死了不少人！” (获点赞6820条)',
              trendingPlatform: 'douyin',
              trendingRank: 'Top 2'
            },
            {
              id: 'RP-402',
              role: '微博造谣大V“花花的世界”',
              author: '微博“花花的世界” (李某)',
              platform: '新浪微博大V评论区',
              type: '恶性造谣',
              penalty: -20,
              content: '“一直听到爆炸声，据说死了50人！” (获点赞13941，回复4328条，恐慌跨平台裂变扩散)',
              trendingPlatform: 'weibo',
              trendingRank: 'Top 1'
            }
          ],
          assets: ['AST-005', 'AST-DOC-02']
        },
        blueCamp: {
          roles: [
            { id: 'B4-1', name: 'K市公安局P区分局网安大队', active: true },
            { id: 'B4-2', name: '市卫健委救治数据组', active: true },
            { id: 'B4-3', name: '市委网信辟谣专班', active: true }
          ],
          measures: [
            {
              id: 'BM-4A2',
              role: 'K市公安局P区分局网安大队',
              category: 'official_notice',
              templateId: 'AST-DOC-02',
              docAssetId: 'AST-DOC-02',
              branchKey: 'positive_a',
              title: '【官方通报发布】选用模版《K市公安局P区分局警情通报》(附件二) 拘留张某10日',
              type: 'positive',
              delta: 20,
              branchName: '走向 4-A2 (雷霆打击铁证辟谣)',
              desc: '卫健委公布救治花名册佐证4死21伤真实底数；公安雷霆出击传唤张某、李某，依治安管理处罚法拘留10日。',
              statement: '【警情通报】经查，网民“小飞飞”（张某）、“花花的世界”（李某）编造传播“担架抬了二十多”、“据说死了50人”虚假谣言，公安机关依法予以行政拘留。',
              trendingPlatform: 'douyin',
              trendingRank: 'Top 1 (辟谣声明)'
            },
            {
              id: 'BM-4B',
              role: '应急值班席',
              category: 'field_operation',
              branchKey: 'negative_b',
              title: '措施 4-B：仅发文“不信谣不传谣”套话 + 无救治数据支撑 + 未查处造谣者',
              type: 'negative',
              delta: -20,
              branchName: '走向 4-B (公众存疑谣言坐实)',
              desc: '缺乏有力事实反驳，未公开定点医院救治数据，公众认定官方掩盖真相，“死50人”成为民间既成定论。',
              statement: '',
              trendingPlatform: '',
              trendingRank: ''
            }
          ],
          statements: ['第二期：K市公安局P区分局《警情通报》']
        }
      },
      {
        id: 'STAGE-05',
        name: '阶段五：新闻发布会与善后定调',
        startTime: '2026-04-09 12:00',
        endTime: '2026-04-09 17:00',
        isCrossDay: false,
        timeTag: '04-09 12:00 ~ 17:00',
        summary: '联合调查组召开新闻发布会，通报燃气爆燃定性、消防生命通道整治、媒体采访知情权保障。',
        selectedBranch: 'branch_a',
        confrontations: [
          {
            id: 'CF-501',
            time: '13:30',
            stageId: 'STAGE-05',
            stageName: '阶段五：新闻发布会与善后定调',
            red: {
              id: 'RP-501',
              role: '现场主流媒体与行业记者团',
              author: '媒体记者连环质询',
              avatar: '🎤',
              platform: '新闻发布会提问席',
              content: '“起火原因到底是不是燃气爆炸？” “物业去年合格检查是否存在猫腻？” “现场个别安保抢夺记者摄像机如何处理？”',
              assetId: '',
              assetName: '',
              penalty: -15,
              trendingPlatform: 'toutiao',
              trendingRank: 'Top 3 (热)'
            },
            blues: [] // 蓝方未发布留空
          },
          {
            id: 'CF-502',
            time: '14:30',
            stageId: 'STAGE-05',
            stageName: '阶段五：新闻发布会与善后定调',
            red: null, // 红方未发布留空
            blues: [
              {
                id: 'BM-5A1',
                role: '联合调查组新闻发言人 (常务副区长)',
                author: '官方新闻发言人',
                avatar: '🏛️',
                category: 'press_conf',
                platform: '新闻发布会全网直播',
                title: '【新闻发布会】全体肃立默哀 + 权威定性燃气爆燃 + 为推搡记者诚恳致歉',
                statement: '【发布会统发口径】起火原因系23层住宅东侧燃气爆燃；全区开展消防生命通道大清障；对抢夺记者设备涉事人员严肃处分，捍卫公众知情权。',
                branchName: '走向 5-A1 (担当诚恳主动定调)',
                docAssetId: '',
                delta: 25,
                trendingPlatform: 'weibo',
                trendingRank: 'Top 1 (权威置顶)'
              }
            ]
          },
          {
            id: 'CF-503',
            time: '15:15',
            stageId: 'STAGE-05',
            stageName: '阶段五：新闻发布会与善后定调',
            red: null, // 红方未发布留空
            blues: [
              {
                id: 'BM-5A2',
                role: '区消防救援大队大队长',
                author: '消防大队长',
                avatar: '🚒',
                category: 'press_conf',
                platform: '新闻发布会答记者问',
                title: '【新闻发布会】详细解答消火栓水压与登高救援科学施救事实',
                statement: '【答记者问】现场共出动3个消防救援站、8辆大跨度登高灭火平台车，首支水枪出水时间为19时08分，物业虚假签名已依法由监察机关立案。',
                branchName: '走向 5-A2 (专业释疑回应当面关切)',
                docAssetId: '',
                delta: 15,
                trendingPlatform: 'baidu',
                trendingRank: '同城榜首'
              }
            ]
          }
        ],
        redCamp: {
          roles: [
            { id: 'R5-1', name: '现场提问记者团 (主流媒体+行业媒体)', active: true },
            { id: 'R5-2', name: '网络直播间围观舆论群体', active: true }
          ],
          posts: [
            {
              id: 'RP-501',
              role: '现场提问记者团',
              author: '媒体记者连环追问',
              platform: '发布会现场提问',
              type: '犀利质询',
              penalty: -15,
              content: '“起火原因到底是不是燃气爆炸？” “物业去年合格检查是否存在猫腻？” “现场个别安保抢夺记者摄像机如何处理？”',
              trendingPlatform: 'toutiao',
              trendingRank: 'Top 3'
            }
          ],
          assets: []
        },
        blueCamp: {
          roles: [
            { id: 'B5-1', name: '联合调查组新闻发言人 (区委常委/常务副区长)', active: true },
            { id: 'B5-2', name: '区消防救援大队大队长', active: true },
            { id: 'B5-3', name: '区公安分局副局长', active: true },
            { id: 'B5-4', name: '区住建局局长', active: true }
          ],
          measures: [
            {
              id: 'BM-5A1',
              role: '联合调查组新闻发言人 (区委常委/常务副区长)',
              category: 'press_conf',
              branchKey: 'positive_a',
              title: '【新闻发布会】起立默哀 + 权威定性燃气爆燃 + 启动全区生命通道清障 + 为推搡记者诚恳致歉',
              type: 'positive',
              delta: 25,
              branchName: '走向 5-A1 (担当诚恳舆论降温)',
              desc: '发布会直面质疑，发言人肃立默哀，公布23层东侧燃气爆燃原因；承诺倒查物业；公开就记者遇阻致歉并推出采访保障机制。',
              statement: '【发布会统发稿】起火原因系23层住宅东侧燃气爆燃；全区开展消防生命通道大清障；对抢夺记者设备涉事人员严肃处分，捍卫公众知情权。',
              trendingPlatform: 'weibo',
              trendingRank: 'Top 1 (权威置顶)'
            },
            {
              id: 'BM-5B',
              role: '发布会联络席',
              category: 'field_operation',
              branchKey: 'negative_b',
              title: '措施 5-B：通篇照念官僚套话 + 回避生命通道与抢设备问题 + 提前掐断记者提问',
              type: 'negative',
              delta: -25,
              branchName: '走向 5-B (发布会沦为灾难现场)',
              desc: '态度傲慢推诿，回答提问避重就轻，提问环节仅安排托儿提问，被网民截取表情包全网二次批判。',
              statement: '',
              trendingPlatform: '',
              trendingRank: ''
            }
          ],
          statements: ['第三期：火灾事故联合调查组新闻发布会统发稿与答问口径']
        }
      }
    ]
  },
  {
    id: 'JB-BULLY-20250612',
    name: 'K市P区学生遭霸凌后自杀事件处置演练',
    type: 'school',
    typeName: '涉校涉生纠纷',
    difficulty: 'hard',
    duration: 90,
    startDate: '2026-06-12',
    endDate: '2026-06-13',
    virtualDuration: 48,
    credibilityBaseline: 100,
    status: 'draft',
    updatedAt: '2026-10-09 16:30',
    creator: '张建军 (教导员)',
    coverUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400',
    bgUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200',
    bgDesc: '初中生在校遭遇长达半学期的言语与肢体欺凌，家属在校门口拉横幅引发公众同情与抗议。',
    stages: []
  },
  {
    id: 'JB-FOOD-20250720',
    name: '某高校食堂疑似食物中毒舆情推演',
    type: 'food',
    typeName: '食品卫生安全',
    difficulty: 'easy',
    duration: 60,
    startDate: '2026-07-20',
    endDate: '2026-07-20',
    virtualDuration: 12,
    credibilityBaseline: 100,
    status: 'disabled',
    updatedAt: '2026-10-08 14:20',
    creator: '李明 (导调组)',
    coverUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
    bgUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200',
    bgDesc: '数十名学生出现急性肠胃炎，疑似食品留样超标，微博校园墙出现大量吐槽。',
    stages: []
  }
];

window.getDrillCartridges = function() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('battle_drill_cartridges');
      if (raw && raw.includes('CF-103')) return JSON.parse(raw);
    }
  } catch (e) {}
  const fresh = JSON.parse(JSON.stringify(window.DEFAULT_DRILL_CARTRIDGES));
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('battle_drill_cartridges', JSON.stringify(fresh));
    }
  } catch (e) {}
  return fresh;
};

window.saveDrillCartridges = function(cartridges) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('battle_drill_cartridges', JSON.stringify(cartridges));
    }
  } catch (e) {}
};
