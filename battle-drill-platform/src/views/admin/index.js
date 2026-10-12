/**
 * 舆情百战演练平台 · 剧本演练编排总控脚本 (V3.2 红蓝对应全平铺实战架构)
 * 核心架构：上方(基本信息、演练周期/虚拟时长与公信力天平) - 中间(红蓝对战矩阵完全平铺不折叠) - 左侧(红方发帖绑定角色与负分) - 右侧(蓝方应对回复与正向加分)
 */
import '../../styles/common/cyber-base.css';
import '../../styles/modules/admin.css';
import { drillEngine } from '../../core/sync-engine.js';
import { getDrillCartridges, saveDrillCartridges } from '../../data/cartridges/index.js';
import { showToast } from '../../components/common/toast.js';

// ==================== 1. 全局数据仓库 (State Store) ====================

// 演练剧本集合 (以火灾事故V6为真实主卡带)
let scriptCartridges = [
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
    coverUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?w=400',
    bgUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200',
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
        // 环节内先红后蓝展示，支持单进攻无防守、一进攻多防守
        confrontations: [
          {
            id: 'CF-101',
            red: {
              id: 'RP-101',
              role: '抖音网民“云朵儿”',
              platform: '抖音短视频',
              content: '“P区X街道花园居小区高层突发爆燃事故！” 视频可见浓烟滚滚、房屋烧毁严重，逃生居民中见十余名穿着校服哭泣的学生。(获8000点赞、560条评论)',
              assetId: 'AST-001',
              assetName: '火灾现场实况视频 (MP4)',
              penalty: -15,
              trendingPlatform: 'douyin',
              trendingRank: 'Top 1 (爆)'
            },
            blues: [
              {
                id: 'BM-1A1',
                role: '市委网信办监测专班',
                category: 'diandian_dispatch',
                title: '【点点迷信指令】调度区应急局与消防大队30分钟内核实现场与伤亡',
                statement: '【点点迷信内部督导】@区应急管理局 @区消防救援大队：网络监测到花园居突发爆燃舆情，请30分钟内紧急报送初核火情、现场伤亡及首批搜救力量！',
                branchName: '走向 1-A (协同高效核实)',
                docAssetId: '',
                delta: 10,
                trendingPlatform: '',
                trendingRank: ''
              },
              {
                id: 'BM-1A2',
                role: '区应急管理局指挥调度席',
                category: 'diandian_reply',
                title: '【点点迷信回复】120名消防官兵抵运现场展开内攻，暂无人员死亡汇报',
                statement: '【点点迷信情况回复】市网信办：区消防120名官兵、8台高喷车已在现场设立警戒区展开内攻灭火，暂无人员死亡，持续跟报进展。',
                branchName: '走向 1-A (首战协同闭环)',
                docAssetId: '',
                delta: 10,
                trendingPlatform: 'weibo',
                trendingRank: '同城榜首'
              }
            ]
          },
          {
            id: 'CF-102',
            red: {
              id: 'RP-102',
              role: '现场聚集围观群众',
              platform: '快手平台 / 微信群',
              content: '“现场火势窜起十几米高，警报声响成一片，有人在窗边挥白毛巾求救！” (多群转发数百次，现场恐慌情绪蔓延)',
              assetId: '',
              assetName: '',
              penalty: -10,
              trendingPlatform: 'kuaishou',
              trendingRank: 'Top 3 (沸)'
            },
            blues: [] // 示范：只有进攻没有防守！待处置应对状态
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
              title: '【点点迷信指令】调度区应急局与消防大队30分钟内核实现场与伤亡',
              type: 'positive',
              delta: 10,
              branchName: '走向 1-A (协同高效核实)',
              desc: '通过点点迷信协同指令平台，要求应急与消防30分钟内精准报送现场火势、伤亡人数及出动力量。',
              statement: '【点点迷信内部督导】@区应急管理局 @区消防救援大队：网络监测到花园居突发爆燃舆情，请30分钟内紧急报送初核火情、现场伤亡及首批搜救力量！',
              trendingPlatform: '',
              trendingRank: ''
            },
            {
              id: 'BM-1A2',
              role: '区应急管理局指挥调度席',
              category: 'diandian_reply',
              targetUnit: '市委网信办',
              branchKey: 'positive_a',
              title: '【点点迷信回复】120名消防官兵抵运现场展开内攻，暂无人员死亡汇报',
              type: 'positive',
              delta: 10,
              branchName: '走向 1-A (首战协同闭环)',
              desc: '区应急指挥席迅速在点点迷信群内回复前方救援力量及伤亡核实情况，为主管部门研判提供第一手权威依据。',
              statement: '【点点迷信情况回复】市网信办：区消防120名官兵、8台高喷车已在现场设立警戒区展开内攻灭火，暂无人员死亡，持续跟报进展。',
              trendingPlatform: 'weibo',
              trendingRank: '同城榜首'
            },
            {
              id: 'BM-1B',
              role: '街道应急值守席',
              category: 'field_operation',
              branchKey: 'negative_b',
              title: '措施 1-B：各部门以“非本管辖”推诿扯皮，超1小时未回应',
              type: 'negative',
              delta: -15,
              branchName: '走向 1-B (失当迟滞失控)',
              desc: '部门间沟通迟缓，现场未划定警戒线，任由围观群众靠近拍摄并二次堵塞道路。',
              statement: '',
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
            red: {
              id: 'RP-201',
              role: '涉事小区业主代表',
              platform: '微博 / 抖音',
              content: '小区消防通道被多辆私家车严重堵塞，消防车被堵在门外进不去！现场一度混乱，#消防通道变死亡通道#引发众怒！',
              assetId: 'AST-002',
              assetName: '消防通道堵死现场监控照片 (JPG)',
              penalty: -15,
              trendingPlatform: 'weibo',
              trendingRank: 'Top 3 (#消防通道变死亡通道#)'
            },
            blues: [
              {
                id: 'BM-2A1',
                role: '消防现场指挥部 & 交警排障组',
                category: 'field_operation',
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
            id: 'CF-202',
            red: {
              id: 'RP-202',
              role: '《红星新闻》驻市记者团队',
              platform: '快手直播 / 微信公众号',
              content: '记者越过警戒线进行现场直播，以“警戒线标注不明”拒绝离开，疑似与现场个别安保发生争夺摄像设备，全网声讨采访遇阻！',
              assetId: 'AST-004',
              assetName: '《采访遇阻》文章扫描件 (PDF)',
              penalty: -15,
              trendingPlatform: 'toutiao',
              trendingRank: 'Top 2 (热)'
            },
            blues: [
              {
                id: 'BM-2A2',
                role: '宣传部媒体协调组',
                category: 'media_interview',
                title: '【突发采访应对】引导记者至安全采访区，现场回应搜救进度保障知情权',
                statement: '【突发采访回应】“感谢媒体监督，现场正在进行高空内攻救援，请记者朋友随同转入安全发布区，我们每半小时通报搜救进展。”',
                branchName: '走向 2-A1 (善待媒体善用媒体)',
                docAssetId: '',
                delta: 10,
                trendingPlatform: '',
                trendingRank: ''
              },
              {
                id: 'BM-2A3',
                role: '联合调查组新闻发言人',
                category: 'official_notice',
                templateId: 'AST-DOC-01',
                docAssetId: 'AST-DOC-01',
                title: '【官方通报发布】选用模版《火灾搜救与基本情况通报》(附件一) 权威发布',
                statement: '【第一期搜救通报】截至21时明火完全扑灭，疏散286人，搜救出伤员21人，4人不幸遇难。联合调查组已成立。',
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
            red: {
              id: 'RP-301',
              role: '快手自媒体“@直击K市现场”',
              platform: '快手平台',
              content: '移花接木其它事件视频声称：“维权家属被便衣警察押上黑车，政府镇压！” 恶意渲染警民冲突。(引发跨群热议)',
              assetId: '',
              assetName: '',
              penalty: -20,
              trendingPlatform: 'kuaishou',
              trendingRank: 'Top 2 (热)'
            },
            blues: [
              {
                id: 'BM-3A1',
                role: '联合善后专班 (街道+卫健)',
                category: 'diandian_dispatch',
                title: '【点点迷信内部督导】一户一专班连夜入驻医院，真诚倾听家属诉求',
                statement: '【点点迷信督导】街道与卫健联合抽调24人组建4个关怀组，一对一帮扶遇难和重伤者家庭，开辟医疗心理双通道。',
                branchName: '走向 3-A1 (温情救济化解矛盾)',
                docAssetId: '',
                delta: 15,
                trendingPlatform: '',
                trendingRank: ''
              }
            ]
          },
          {
            id: 'CF-302',
            red: {
              id: 'RP-302',
              role: '微博组织“@正义家长联盟”',
              platform: '微博同城话题',
              content: '“育才中学学生火灾中逃生！教育局明面取消晚自习暗地纵容居民楼补课！拿孩子命换升学率？#补课黑产业链#” (转发4.1万)',
              assetId: '',
              assetName: '',
              penalty: -15,
              trendingPlatform: 'weibo',
              trendingRank: 'Top 4 (#补课黑产业链#)'
            },
            blues: [
              {
                id: 'BM-3A2',
                role: '区教育局核查专班',
                category: 'official_notice',
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
            id: 'CF-303',
            red: {
              id: 'RP-303',
              role: '业主群维权爆料网民',
              platform: '小红书 / 微信群',
              content: '“去年消防检查合格是物业伪造签字！消火栓箱里根本没有水枪水带！XX物业谋杀业主！” (附空箱照片)',
              assetId: 'AST-003',
              assetName: '空消火栓箱与伪造签字图 (PNG)',
              penalty: -15,
              trendingPlatform: 'douyin',
              trendingRank: 'Top 5'
            },
            blues: [
              {
                id: 'BM-3A3',
                role: '区住建局与消防执法科',
                category: 'field_operation',
                title: '查封涉事物业历年消防台账 + 纪检监察倒查维保虚假签字',
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
            red: {
              id: 'RP-401',
              role: '抖音造谣网民“小飞飞”',
              platform: '潇湘晨报短视频评论区',
              content: '“我就在对面小区住，亲眼看到来了好多消防员，担架都抬了二十多个，应该死了不少人！” (获点赞6820条)',
              assetId: '',
              assetName: '',
              penalty: -15,
              trendingPlatform: 'douyin',
              trendingRank: 'Top 2 (热)'
            },
            blues: [
              {
                id: 'BM-4A1',
                role: '市委网信辟谣专班',
                category: 'diandian_dispatch',
                title: '【点点迷信指令】指令公安网安锁定“小飞飞”账号IP与真实身份',
                statement: '【点点迷信指令】@区公安分局网安大队：请立即对抖音造谣账号“小飞飞”进行溯源落地，锁定造谣者现住址！',
                branchName: '走向 4-A1 (技术溯源锁定)',
                docAssetId: '',
                delta: 10,
                trendingPlatform: '',
                trendingRank: ''
              },
              {
                id: 'BM-4A2',
                role: 'K市公安局P区分局 (网安/治安)',
                category: 'official_notice',
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
            id: 'CF-402',
            red: {
              id: 'RP-402',
              role: '微博造谣大V“花花的世界”',
              platform: '新浪微博大V评论区',
              content: '“一直听到爆炸声，据说死了50人！” (获点赞13941，回复4328条，恐慌跨平台裂变扩散)',
              assetId: '',
              assetName: '',
              penalty: -20,
              trendingPlatform: 'weibo',
              trendingRank: 'Top 1 (爆)'
            },
            blues: [
              {
                id: 'BM-4A3',
                role: 'K市公安局P区分局 & 市卫健委',
                category: 'official_notice',
                templateId: 'AST-DOC-02',
                docAssetId: 'AST-DOC-02',
                title: '【官方通报发布】公布定点收治医院真实花名册，依法行政拘留李某10日',
                statement: '【警情通报】违法嫌疑人李某故意编造传播“据说死了50人”虚假谣言，已被依法行政拘留10日。网络不是法外之地！',
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
            red: {
              id: 'RP-501',
              role: '现场主流媒体与行业记者团',
              platform: '新闻发布会提问席',
              content: '“起火原因到底是不是燃气爆炸？” “物业去年合格检查是否存在猫腻？” “现场个别安保抢夺记者摄像机如何处理？”',
              assetId: '',
              assetName: '',
              penalty: -15,
              trendingPlatform: 'toutiao',
              trendingRank: 'Top 3 (热)'
            },
            blues: [
              {
                id: 'BM-5A1',
                role: '联合调查组新闻发言人 (区委常委/常务副区长)',
                category: 'press_conf',
                title: '【新闻发布会】全体肃立默哀 + 权威定性燃气爆燃 + 为推搡记者诚恳致歉',
                statement: '【发布会统发口径】起火原因系23层住宅东侧燃气爆燃；全区开展消防生命通道大清障；对抢夺记者设备涉事人员严肃处分，捍卫公众知情权。',
                branchName: '走向 5-A1 (担当诚恳主动定调)',
                docAssetId: '',
                delta: 25,
                trendingPlatform: 'weibo',
                trendingRank: 'Top 1 (权威置顶)'
              },
              {
                id: 'BM-5A2',
                role: '区消防救援大队大队长',
                category: 'press_conf',
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

// 全局同步挂载供其他终端使用
if (typeof window !== 'undefined') {
  window.DEFAULT_DRILL_CARTRIDGES = scriptCartridges;
}

// 多模态素材库 (增加火灾事故V6两期官方通报红头模版)
let assetLibrary = [
  {
    id: 'AST-DOC-01',
    name: '《关于P区花园居小区火灾搜救与基本情况通报》 (附件一·首发搜救通报)',
    category: 'doc',
    catName: '官方通报模版',
    format: '红头公函',
    size: '42.5 KB',
    duration: '-',
    url: '',
    thumb: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400',
    desc: '【火灾V6附件一官方原件】4月8日21:30发布。明火完全扑灭，疏散286人，搜救出伤员21人，4人不幸遇难。成立联合调查组倒查责任。'
  },
  {
    id: 'AST-DOC-02',
    name: '《K市公安局P区分局警情通报》 (附件二·依法拘留网络造谣者)',
    category: 'doc',
    catName: '官方通报模版',
    format: '红头公函',
    size: '38.2 KB',
    duration: '-',
    url: '',
    thumb: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=400',
    desc: '【火灾V6附件二官方原件】4月9日11:30发布。依法对编造“担架抬了二十多”、“据说死了50人”的张某、李某拘留10日，吴某、王某拘留5日。'
  },
  {
    id: 'AST-001',
    name: 'P区花园居小区高层爆燃现场实况视频',
    category: 'video',
    catName: '现场视频',
    format: 'MP4',
    size: '6.28 MB',
    duration: '00:45',
    url: './media/fire_material_video.mp4',
    thumb: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?w=400',
    desc: '高层住宅浓烟滚滚、房屋烧毁严重，逃离居民中见十余名穿着校服哭泣学生。已挂接至红方阶段一。'
  },
  {
    id: 'AST-002',
    name: '小区消防通道被私家车堵死现场监控照片',
    category: 'image',
    catName: '现场照片',
    format: 'JPG',
    size: '2.4 MB',
    duration: '-',
    url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400',
    thumb: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400',
    desc: '私家车与杂物堆放堵塞消防生命通道，佐证消防车受阻现场。'
  },
  {
    id: 'AST-003',
    name: '业主群疯传空消火栓箱与伪造检查签字照片',
    category: 'image',
    catName: '隐患物证',
    format: 'PNG',
    size: '1.2 MB',
    duration: '-',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
    thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
    desc: '消火栓无水枪水带，全网声讨物业公司伪造安全合格签字。'
  },
  {
    id: 'AST-004',
    name: '《记者K市P区燃爆事故采访遇阻》文章扫描件',
    category: 'doc',
    catName: '媒体舆情',
    format: 'PDF',
    size: '1.8 MB',
    duration: '-',
    url: '',
    thumb: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400',
    desc: '记者以警戒线不明越界直播，个别安保抢夺摄像设备引发知情权争议。'
  },
  {
    id: 'AST-005',
    name: 'K市公安局P区分局《警情通报》(行政拘留4人)公函照片',
    category: 'image',
    catName: '权威通报',
    format: 'JPG',
    size: '3.1 MB',
    duration: '-',
    url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=400',
    thumb: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=400',
    desc: '依法对编造“担架抬了二十多个”、“据说死了50人”的造谣人员行政拘留。'
  }
];

// 实战案例档案库
let caseArchiveList = [
  {
    id: 'CASE-01',
    code: 'DOC-FIRE-V6',
    title: '演练材料一：火灾事故V6.doc',
    industry: '城市消防与安全生产',
    fileSize: '570.5 KB',
    parseStatus: '已完整解析 (5阶段/12话术)',
    desc: '涵盖省会核心区高层爆燃、120名消防员救援、消防通道堵塞、记者抢设备冲突、家属上街、网络造谣死50人拘留、联合调查组新闻发布会全流程。'
  },
  {
    id: 'CASE-02',
    code: 'DOC-BULLY-V6',
    title: '演练材料二：K市P区学生遭霸凌后自杀V6.docx',
    industry: '教育校园与未成年保护',
    fileSize: '21.8 KB',
    parseStatus: '已完整解析 (3阶段/6话术)',
    desc: '校园欺凌衍生网络舆情发酵，重点考察教育与公安的跨部门核查与柔性舆论引导。'
  }
];

// 演练历史台账
let drillHistoryList = [
  { id: 'DR-2026-001', title: '2026年春季突发高层火灾舆情实战推演', script: 'K市P区某居民楼突发火灾爆燃与网络造谣处置演练', diff: '中等', score: '95 分 (优秀)', time: '2026-04-09 17:30' },
  { id: 'DR-2026-002', title: '涉校学生霸凌事件红蓝攻防对抗第一期', script: 'K市P区学生遭霸凌后自杀事件处置演练', diff: '困难', score: '82 分 (良好)', time: '2026-04-02 11:00' }
];

// 当前工作台活动剧本卡带及活动环节
let activeCartridgeId = 'JB-FIRE-20250408';
let currentWorkbenchScript = null;
let currentActiveStageId = 'STAGE-01';
let currentAssetCategory = 'all';

// ==================== 1.1 红蓝攻防上榜单辅助渲染与时间倍速引擎 ====================

function getTrendingBadgeHtml(platform, rank, customClass = '') {
  if (!platform) return '';
  const platformMap = {
    weibo: { name: '微博热搜', icon: '🔴', cls: 'pill-platform-weibo' },
    douyin: { name: '抖音热榜', icon: '🎵', cls: 'pill-platform-douyin' },
    toutiao: { name: '今日头条', icon: '📰', cls: 'pill-platform-toutiao' },
    kuaishou: { name: '快手热搜', icon: '⚡', cls: 'pill-platform-kuaishou' },
    baidu: { name: '百度热搜', icon: '🔍', cls: 'pill-platform-baidu' }
  };
  const info = platformMap[platform] || { name: '网络热搜', icon: '🔥', cls: 'pill-platform-weibo' };
  const rankText = rank || '热榜';
  const isBlue = customClass.includes('blue');
  const pillTypeCls = isBlue ? 'trending-pill-blue' : 'trending-pill-red';
  return `
    <span class="trending-rank-pill ${pillTypeCls} ${info.cls} ${customClass}" title="该事件已登上${info.name} ${rankText}">
      <span>🔥</span>
      <span>${info.name}</span>
      <span class="pill-rank-badge">${rankText}</span>
    </span>
  `;
}

function onTimeSpeedChange(val) {
  if (currentWorkbenchScript) {
    currentWorkbenchScript.timeSpeed = Number(val);
    const speed = Number(val);
    const dayRatio = speed === 24 ? '1天' : (speed === 12 ? '半天' : (speed === 48 ? '2天' : (speed === 72 ? '3天' : `${speed}小时`)));
    showToast(`⚡ 演练时间倍速已切换为: ${val}.0x (真实1小时 = 实际${dayRatio})`, 'info');
  }
}

// ==================== 2. 页面初始化 ====================

// 将所有卡带修改全局持久化到 localStorage
function persistCartridges() {
  try {
    if (typeof window.saveDrillCartridges === 'function') {
      window.saveDrillCartridges(scriptCartridges);
    } else if (typeof localStorage !== 'undefined') {
      localStorage.setItem('battle_drill_cartridges', JSON.stringify(scriptCartridges));
    }
  } catch (e) {
    console.warn('保存剧本卡带数据失败:', e);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // 优先从 localStorage 加载保存的剧本卡带（包括自定义上传的封面与背景图）
  if (typeof window.getDrillCartridges === 'function') {
    const loaded = window.getDrillCartridges();
    if (Array.isArray(loaded) && loaded.length > 0) {
      scriptCartridges = loaded;
    }
  } else if (typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem('battle_drill_cartridges');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          scriptCartridges = parsed;
        }
      }
    } catch (e) {}
  }

  currentWorkbenchScript = scriptCartridges.find(s => s.id === activeCartridgeId) || scriptCartridges[0];
  initTopCartridge();
  initNavigation();
  renderScriptTable();
  renderAssetVaultGrid();
  loadScriptToTriGridWorkbench(currentWorkbenchScript.id);
  initVisualDropZones();
});

// 顶栏卡带状态指示
function initTopCartridge() {
  const activeScript = scriptCartridges.find(s => s.status === 'active');
  const titleEl = document.getElementById('topCartridgeTitle');
  const badgeEl = document.getElementById('topCartridgeBadge');
  const sideCartName = document.getElementById('sideCartridgeName');

  if (activeScript && titleEl && badgeEl) {
    titleEl.textContent = `[${activeScript.id}] ${activeScript.name}`;
    badgeEl.className = 'cartridge-status-badge badge-active';
    badgeEl.innerHTML = '<span class="pulse-dot"></span> 演练中';
    activeCartridgeId = activeScript.id;
  }
  if (sideCartName && activeScript) {
    sideCartName.textContent = activeScript.name;
  }
  updateSidebarStats();
}

function updateSidebarStats() {
  const totalEl = document.getElementById('sidebarTotalScripts');
  const activeEl = document.getElementById('sidebarActiveCount');
  const draftEl = document.getElementById('sidebarDraftCount');
  const disabledEl = document.getElementById('sidebarDisabledCount');
  const kpiTotal = document.getElementById('kpiTotalScripts');

  const activeCount = scriptCartridges.filter(s => s.status === 'active').length;
  const draftCount = scriptCartridges.filter(s => s.status === 'draft').length;
  const disabledCount = scriptCartridges.filter(s => s.status === 'disabled').length;

  if (totalEl) totalEl.textContent = scriptCartridges.length;
  if (kpiTotal) kpiTotal.textContent = scriptCartridges.length;
  if (activeEl) activeEl.textContent = activeCount;
  if (draftEl) draftEl.textContent = draftCount;
  if (disabledEl) disabledEl.textContent = disabledCount;
}

// 侧边栏导航切换
function initNavigation() {
  const navBtns = document.querySelectorAll('.nav-item');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const route = btn.getAttribute('data-route');
      switchViewPanel(route);
    });
  });
}

function switchViewPanel(route) {
  const panels = document.querySelectorAll('.admin-view-panel');
  panels.forEach(p => p.style.display = 'none');

  const targetMap = {
    'script_list': 'panel_script_list',
    'script_workbench': 'panel_script_workbench',
    'case_archive': 'panel_case_archive',
    'asset_vault': 'panel_asset_vault',
    'drill_history': 'panel_drill_history'
  };

  const targetPanelId = targetMap[route] || 'panel_script_list';
  const targetPanel = document.getElementById(targetPanelId);
  if (targetPanel) {
    targetPanel.style.display = 'flex';
  }
}

function returnToScriptList() {
  const listNav = document.getElementById('nav_script_list');
  const wbNav = document.getElementById('nav_script_workbench');
  listNav?.classList.add('active');
  wbNav?.classList.remove('active');
  switchViewPanel('script_list');
}

// ==================== 3. 剧本演练列表功能 ====================

function renderScriptTable() {
  const tbody = document.getElementById('scriptTableBody');
  const countEl = document.getElementById('scriptListCount');
  if (!tbody) return;

  const keyword = (document.getElementById('searchScriptKeyword')?.value || '').trim().toLowerCase();
  const diffFilter = document.getElementById('searchScriptDifficulty')?.value || '';
  const statusFilter = document.getElementById('searchScriptStatus')?.value || '';

  const filtered = scriptCartridges.filter(s => {
    const matchKw = !keyword || s.name.toLowerCase().includes(keyword) || s.id.toLowerCase().includes(keyword);
    const matchDiff = !diffFilter || s.difficulty === diffFilter;
    const matchStatus = !statusFilter || s.status === statusFilter;
    return matchKw && matchDiff && matchStatus;
  });

  if (countEl) countEl.textContent = filtered.length;
  tbody.innerHTML = '';

  filtered.forEach(item => {
    let statusBadge = '';
    let toggleBtnText = '';
    let toggleBtnClass = 'btn-default';

    if (item.status === 'active') {
      statusBadge = '<span class="cartridge-status-badge badge-active"><span class="pulse-dot"></span> 演练中</span>';
      toggleBtnText = '停用卡带';
      toggleBtnClass = 'btn-default';
    } else if (item.status === 'draft') {
      statusBadge = '<span class="cartridge-status-badge badge-draft">● 草稿</span>';
      toggleBtnText = '设为演练';
      toggleBtnClass = 'btn-primary';
    } else {
      statusBadge = '<span class="cartridge-status-badge badge-disabled">● 未启用</span>';
      toggleBtnText = '设为演练';
      toggleBtnClass = 'btn-primary';
    }

    const diffMap = {
      'easy': '<span style="color:#16a34a; font-weight:600;">简单 (指引)</span>',
      'medium': '<span style="color:#2563eb; font-weight:600;">中等 (实战)</span>',
      'hard': '<span style="color:#ea580c; font-weight:600;">困难 (高压)</span>',
      'hell': '<span style="color:#dc2626; font-weight:700;">地狱 (博弈)</span>'
    };

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <img src="${item.coverUrl || 'https://images.unsplash.com/photo-1542385151-efd9000785a0?w=400'}" class="table-cover-thumb" alt="封面" onclick="openScriptVisualsModal('${item.id}')" title="点击配置封面与大屏背景" style="cursor:pointer;">
      </td>
      <td><strong style="color:var(--text-strong); font-size:12.5px;">${item.id}</strong></td>
      <td>
        <strong style="color:var(--text-title); font-size:13.5px;">${item.name}</strong>
        <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">${item.typeName} · 创建人: ${item.creator}</div>
      </td>
      <td>${diffMap[item.difficulty] || item.difficulty}</td>
      <td>
        <span style="font-weight:700; color:#4338ca;">${item.virtualDuration || 90} 分钟</span>
        <div style="font-size:10.5px; color:var(--text-muted);">${item.startDate || '2026-04-08'}</div>
      </td>
      <td><span style="font-weight:700; color:var(--success);">${item.credibilityBaseline || 100} 分</span></td>
      <td><span style="color:var(--primary); font-weight:600;">${item.stages ? item.stages.length : 0} 个阶段</span></td>
      <td>${statusBadge}</td>
      <td style="font-size:11.5px; color:var(--text-muted);">${item.updatedAt}</td>
      <td style="text-align:center;">
        <div class="table-actions-inline">
          <button class="btn-primary" style="padding:4px 8px; font-size:11.5px;" onclick="openWorkbenchForScript('${item.id}')">进入编排</button>
          <button class="btn-default" style="padding:4px 7px; font-size:11px;" onclick="openScriptVisualsModal('${item.id}')">🖼️ 封面/背景</button>
          <button class="${toggleBtnClass}" style="padding:4px 7px; font-size:11px;" onclick="promptToggleCartridge('${item.id}')">${toggleBtnText}</button>
          <button class="btn-link-danger" onclick="promptDeleteScript('${item.id}')">删除</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function resetScriptSearch() {
  if (document.getElementById('searchScriptKeyword')) document.getElementById('searchScriptKeyword').value = '';
  if (document.getElementById('searchScriptDifficulty')) document.getElementById('searchScriptDifficulty').value = '';
  if (document.getElementById('searchScriptStatus')) document.getElementById('searchScriptStatus').value = '';
  renderScriptTable();
}

function openWorkbenchForScript(scriptId) {
  loadScriptToTriGridWorkbench(scriptId);
  const listNav = document.getElementById('nav_script_list');
  const wbNav = document.getElementById('nav_script_workbench');
  listNav?.classList.remove('active');
  wbNav?.classList.add('active');
  switchViewPanel('script_workbench');
}

// ==================== 封面与背景图设置逻辑 (支持本地图片上传、拖拽、压缩持久化) ====================
let currentVisualTargetScriptId = null;

// 格式化文件大小
function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// 本地图片压缩为高画质 Base64 (防止超大文件撑爆存储)
function compressImageFile(file, maxWidth, maxHeight, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > maxWidth || h > maxHeight) {
          if (w / maxWidth > h / maxHeight) {
            h = Math.round(h * (maxWidth / w));
            w = maxWidth;
          } else {
            w = Math.round(w * (maxHeight / h));
            h = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        resolve(canvas.toDataURL(format, quality));
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 统一本地图片处理与上传（先尝试 Node 服务端 /api/upload 保存至本地磁盘 uploads/，失败则使用压缩 Base64 降级）
async function uploadLocalImage(file, isBackground, callbacks) {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showToast('⚠️ 请上传有效的图片格式文件 (PNG, JPG, WEBP, SVG等)！', 'warning');
    return;
  }

  try {
    if (callbacks.onProgress) callbacks.onProgress('正在优化读取本地图片...');
    const maxW = isBackground ? 1920 : 800;
    const maxH = isBackground ? 1080 : 600;
    const compressedData = await compressImageFile(file, maxW, maxH, 0.86);

    let finalUrl = compressedData;
    let isServerSaved = false;

    // 尝试向服务端上传文件
    try {
      const resp = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: file.name,
          data: compressedData
        })
      });
      if (resp.ok) {
        const json = await resp.json();
        if (json && json.success && json.url) {
          finalUrl = json.url;
          isServerSaved = true;
        }
      }
    } catch (netErr) {
      // 离线或静态服务，继续使用 Base64
    }

    if (callbacks.onSuccess) {
      callbacks.onSuccess({
        url: finalUrl,
        fileName: file.name,
        fileSize: file.size,
        isServerSaved
      });
    }
  } catch (err) {
    console.error('Image upload failed:', err);
    if (callbacks.onError) callbacks.onError(err);
    showToast('本地图片载入失败，请重试！', 'warning');
  }
}

// 初始化拖拽监听
function initVisualDropZones() {
  const setupDrop = (zoneId, isBg) => {
    const zone = document.getElementById(zoneId);
    if (!zone) return;

    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.remove('drag-over');
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.remove('drag-over');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        if (isBg) {
          handleBgFileProcess(e.dataTransfer.files[0]);
        } else {
          handleCoverFileProcess(e.dataTransfer.files[0]);
        }
      }
    });
  };

  setupDrop('coverDropZone', false);
  setupDrop('bgDropZone', true);
}

// 封面图片上传处理核心
function handleCoverFileProcess(file) {
  const statusEl = document.getElementById('coverUploadStatus');
  const previewImg = document.getElementById('visualCoverPreviewImg');
  const inputEl = document.getElementById('visualCoverInput');

  if (statusEl) statusEl.innerHTML = '<span style="color:#2563eb;">⏳ 正在读取本地图片...</span>';

  uploadLocalImage(file, false, {
    onSuccess: (res) => {
      if (previewImg) previewImg.src = res.url;
      if (inputEl) inputEl.value = res.url;
      if (statusEl) {
        statusEl.innerHTML = `<span class="upload-status-tag">✅ 已载入本地封面: ${res.fileName} (${formatFileSize(res.fileSize)})</span>`;
      }
      showToast(`📁 本地封面 [${res.fileName}] 载入成功！请点击保存`, 'success');
    },
    onError: () => {
      if (statusEl) statusEl.innerHTML = '<span style="color:#dc2626;">❌ 载入失败</span>';
    }
  });
}

// 背景图片上传处理核心
function handleBgFileProcess(file) {
  const statusEl = document.getElementById('bgUploadStatus');
  const previewImg = document.getElementById('visualBgPreviewImg');
  const inputEl = document.getElementById('visualBgInput');

  if (statusEl) statusEl.innerHTML = '<span style="color:#2563eb;">⏳ 正在读取本地大屏底图...</span>';

  uploadLocalImage(file, true, {
    onSuccess: (res) => {
      if (previewImg) previewImg.src = res.url;
      if (inputEl) inputEl.value = res.url;
      if (statusEl) {
        statusEl.innerHTML = `<span class="upload-status-tag">✅ 已载入本地背景: ${res.fileName} (${formatFileSize(res.fileSize)})</span>`;
      }
      showToast(`📁 本地大屏背景 [${res.fileName}] 载入成功！请点击保存`, 'success');
    },
    onError: () => {
      if (statusEl) statusEl.innerHTML = '<span style="color:#dc2626;">❌ 载入失败</span>';
    }
  });
}

function handleLocalCoverSelected(input) {
  if (input.files && input.files[0]) {
    handleCoverFileProcess(input.files[0]);
  }
}

function handleLocalBgSelected(input) {
  if (input.files && input.files[0]) {
    handleBgFileProcess(input.files[0]);
  }
}

// 新建剧本弹窗中的本地上传
function handleNewScriptLocalCover(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    uploadLocalImage(file, false, {
      onSuccess: (res) => {
        const coverInput = document.getElementById('newScriptCover');
        if (coverInput) coverInput.value = res.url;
        showToast(`📁 新剧本封面 [${file.name}] 已上传`, 'success');
      }
    });
  }
}

function handleNewScriptLocalBg(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    uploadLocalImage(file, true, {
      onSuccess: (res) => {
        const bgInput = document.getElementById('newScriptBgImg');
        if (bgInput) bgInput.value = res.url;
        showToast(`📁 新剧本背景底图 [${file.name}] 已上传`, 'success');
      }
    });
  }
}

function onCoverUrlInput(val) {
  const img = document.getElementById('visualCoverPreviewImg');
  if (img && val) img.src = val.trim();
  const statusEl = document.getElementById('coverUploadStatus');
  if (statusEl) statusEl.innerHTML = '';
}

function onBgUrlInput(val) {
  const img = document.getElementById('visualBgPreviewImg');
  if (img && val) img.src = val.trim();
  const statusEl = document.getElementById('bgUploadStatus');
  if (statusEl) statusEl.innerHTML = '';
}

function openScriptVisualsModal(scriptId) {
  const script = scriptCartridges.find(s => s.id === scriptId) || currentWorkbenchScript;
  if (!script) return;
  currentVisualTargetScriptId = script.id;

  const targetNameEl = document.getElementById('visualTargetScriptName');
  const coverInput = document.getElementById('visualCoverInput');
  const coverImg = document.getElementById('visualCoverPreviewImg');
  const bgInput = document.getElementById('visualBgInput');
  const bgImg = document.getElementById('visualBgPreviewImg');
  const coverStatus = document.getElementById('coverUploadStatus');
  const bgStatus = document.getElementById('bgUploadStatus');

  if (targetNameEl) targetNameEl.textContent = `[${script.id}] ${script.name}`;
  if (coverInput) coverInput.value = script.coverUrl || 'https://images.unsplash.com/photo-1542385151-efd9000785a0?w=400';
  if (coverImg) coverImg.src = script.coverUrl || 'https://images.unsplash.com/photo-1542385151-efd9000785a0?w=400';
  if (bgInput) bgInput.value = script.bgUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200';
  if (bgImg) bgImg.src = script.bgUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200';

  if (coverStatus) coverStatus.innerHTML = '';
  if (bgStatus) bgStatus.innerHTML = '';

  const coverFileInput = document.getElementById('coverFileInput');
  if (coverFileInput) coverFileInput.value = '';
  const bgFileInput = document.getElementById('bgFileInput');
  if (bgFileInput) bgFileInput.value = '';

  openModal('modal_script_visuals');
}

function choosePresetCover() {
  const coverInput = document.getElementById('visualCoverInput');
  const coverImg = document.getElementById('visualCoverPreviewImg');
  const statusEl = document.getElementById('coverUploadStatus');
  const preset = 'https://images.unsplash.com/photo-1542385151-efd9000785a0?w=400';
  if (coverInput) coverInput.value = preset;
  if (coverImg) coverImg.src = preset;
  if (statusEl) statusEl.innerHTML = '<span class="upload-status-tag">✨ 预设：经典高层火灾</span>';
  showToast('已切换为经典高层火灾现场实况封面预设！', 'info');
}

function choosePresetBg() {
  const bgInput = document.getElementById('visualBgInput');
  const bgImg = document.getElementById('visualBgPreviewImg');
  const statusEl = document.getElementById('bgUploadStatus');
  const preset = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200';
  if (bgInput) bgInput.value = preset;
  if (bgImg) bgImg.src = preset;
  if (statusEl) statusEl.innerHTML = '<span class="upload-status-tag">✨ 预设：赛博红蓝战境</span>';
  showToast('已切换为赛博红蓝实战指挥舱背景底图预设！', 'info');
}

function saveScriptVisuals() {
  const script = scriptCartridges.find(s => s.id === currentVisualTargetScriptId);
  if (!script) return;

  const coverVal = document.getElementById('visualCoverInput')?.value?.trim();
  const bgVal = document.getElementById('visualBgInput')?.value?.trim();

  if (coverVal) script.coverUrl = coverVal;
  if (bgVal) script.bgUrl = bgVal;

  if (currentWorkbenchScript && currentWorkbenchScript.id === script.id) {
    currentWorkbenchScript.coverUrl = script.coverUrl;
    currentWorkbenchScript.bgUrl = script.bgUrl;
  }

  // 更新侧边栏预览（如果是当前活动卡带）
  if (script.status === 'active') {
    const sideImg = document.getElementById('sideCoverImg');
    if (sideImg) sideImg.src = script.coverUrl;
  }

  // 持久化到 localStorage
  persistCartridges();

  // 广播卡带数据给大屏与PC终端
  broadcastActiveCartridgeToSyncEngine(script);

  closeModal('modal_script_visuals');
  renderScriptTable();
  showToast(`🖼️ 剧本 [${script.id}] 封面图与大屏背景图已更新并全局同步！`, 'success');
}

// 设为演练 / 停用
let targetToggleScriptId = null;
function promptToggleCartridge(scriptId) {
  targetToggleScriptId = scriptId;
  const script = scriptCartridges.find(s => s.id === scriptId);
  if (!script) return;

  const titleEl = document.getElementById('toggleModalTitle');
  const contentEl = document.getElementById('toggleModalContent');
  const btnEl = document.getElementById('btnConfirmToggle');

  if (script.status === 'active') {
    titleEl.textContent = `确认停用剧本卡带？`;
    contentEl.innerHTML = `您正在停用 <strong>[${script.id}] ${script.name}</strong>。<br>停用后各作战端将暂停新事件注入，历史推演轨迹将归档。是否确认？`;
    btnEl.textContent = '确认停用';
    btnEl.className = 'btn-danger';
  } else {
    titleEl.textContent = `确认将此剧本设为演练状态？`;
    contentEl.innerHTML = `即将把 <strong>[${script.id}] ${script.name}</strong> 载入演练总控！<br><span style="color:var(--primary); font-weight:600;">切换后，大屏端、PC战境对战端、H5群聊端将实时同步载入此剧本的红蓝分支走向与公信力规则。</span>原运行剧本将自动停用。是否确认？`;
    btnEl.textContent = '确认切换';
    btnEl.className = 'btn-primary';
  }
  openModal('modal_toggle_drill');
}

function confirmToggleScriptStatus() {
  if (!targetToggleScriptId) return;
  const script = scriptCartridges.find(s => s.id === targetToggleScriptId);
  if (!script) return;

  if (script.status === 'active') {
    script.status = 'disabled';
    showToast(`剧本 [${script.id}] 已停用！`, 'info');
  } else {
    scriptCartridges.forEach(s => { if (s.status === 'active') s.status = 'disabled'; });
    script.status = 'active';
    activeCartridgeId = script.id;
    showToast(`🎉 剧本 [${script.id}] 已设为全局演练卡带！终端已同步。`, 'success');
    broadcastActiveCartridgeToSyncEngine(script);
  }

  persistCartridges();
  closeModal('modal_toggle_drill');
  initTopCartridge();
  renderScriptTable();
}

function promptDeleteScript(scriptId) {
  const script = scriptCartridges.find(s => s.id === scriptId);
  if (!script) return;
  if (script.status === 'active') {
    showToast('⚠️ 该剧本正在实战演练中，严禁删除！请先停用或切换卡带。', 'danger');
    return;
  }
  if (confirm(`确定要彻底删除剧本 [${script.id}] ${script.name} 吗？`)) {
    scriptCartridges = scriptCartridges.filter(s => s.id !== scriptId);
    persistCartridges();
    showToast('剧本已彻底删除！', 'info');
    updateSidebarStats();
    renderScriptTable();
  }
}

function openNewScriptModal() {
  const codeEl = document.getElementById('newScriptCode');
  if (codeEl) codeEl.value = 'JB-AUTO-' + Math.floor(100000 + Math.random() * 900000);
  openModal('modal_new_script');
}

function submitCreateScript() {
  const code = document.getElementById('newScriptCode')?.value;
  const name = document.getElementById('newScriptName')?.value?.trim();
  const diff = document.getElementById('newScriptDifficulty')?.value || 'medium';
  const duration = Number(document.getElementById('newScriptDuration')?.value) || 120;
  const desc = document.getElementById('newScriptDesc')?.value?.trim() || '';
  const initialStatus = document.querySelector('input[name="newScriptInitialStatus"]:checked')?.value || 'draft';
  const coverUrl = document.getElementById('newScriptCover')?.value?.trim() || 'https://images.unsplash.com/photo-1542385151-efd9000785a0?w=400';
  const bgUrl = document.getElementById('newScriptBgImg')?.value?.trim() || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200';

  if (!name) {
    showToast('请输入剧本名称！', 'warning');
    return;
  }

  const newScript = {
    id: code,
    name: name,
    type: 'custom',
    typeName: '自定义应急演练',
    difficulty: diff,
    duration: duration,
    credibilityBaseline: 100,
    status: initialStatus,
    updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    creator: '汪艳琼',
    coverUrl: coverUrl,
    bgUrl: bgUrl,
    bgDesc: desc,
    stages: [
      {
        id: 'STAGE-01',
        name: '阶段一：初始舆情发现',
        timeTag: 'T+0 ~ T+15',
        summary: '初始爆料苗头出现。',
        selectedBranch: 'branch_a',
        redCamp: {
          roles: [{ id: 'R1', name: '首发曝光账号', active: true }],
          posts: [{ id: 'P1', author: '爆料网民', platform: '微博', type: '爆料', severity: 3, content: '现场出现突发状况！' }],
          assets: []
        },
        blueCamp: {
          roles: [{ id: 'B1', name: '应急值班指挥席', active: true }],
          measures: [
            { id: 'M1A', branchKey: 'branch_a', title: '及时核实并发布首报', type: 'positive', delta: 10, branchName: '走向 1-A (正向)', desc: '迅速发声稳定情绪。' },
            { id: 'M1B', branchKey: 'branch_b', title: '未予理睬导致发酵', type: 'negative', delta: -15, branchName: '走向 1-B (失当)', desc: '拖延失控。' }
          ],
          statements: []
        }
      }
    ]
  };

  if (initialStatus === 'active') {
    scriptCartridges.forEach(s => { if (s.status === 'active') s.status = 'disabled'; });
    broadcastActiveCartridgeToSyncEngine(newScript);
  }

  scriptCartridges.unshift(newScript);
  persistCartridges();
  closeModal('modal_new_script');
  showToast('新剧本创建成功！已载入编排工作台。', 'success');
  initTopCartridge();
  renderScriptTable();
  openWorkbenchForScript(newScript.id);
}

// ==================== 4. 剧本编排工作台 (上-中-左-右 核心引擎) ====================

function loadScriptToTriGridWorkbench(scriptId) {
  const script = scriptCartridges.find(s => s.id === scriptId) || scriptCartridges[0];
  if (!script) return;
  currentWorkbenchScript = script;

  // 1. 上方基本信息与演练周期/虚拟时长配置
  const nameInput = document.getElementById('wbTopScriptName');
  const diffSelect = document.getElementById('wbTopDifficulty');
  const startDateInput = document.getElementById('wbTopStartDate');
  const endDateInput = document.getElementById('wbTopEndDate');
  const virtualDurSelect = document.getElementById('wbTopVirtualDuration');
  const timeSpeedSelect = document.getElementById('wbTopTimeSpeed');
  const statusBadge = document.getElementById('wbTopStatusBadge');

  if (nameInput) nameInput.value = script.name;
  if (diffSelect) diffSelect.value = script.difficulty;
  if (startDateInput) startDateInput.value = script.startDate || '2026-04-08';
  if (endDateInput) endDateInput.value = script.endDate || '2026-04-09';
  if (virtualDurSelect) virtualDurSelect.value = script.virtualDuration || '90';
  if (timeSpeedSelect) timeSpeedSelect.value = script.timeSpeed || '24';

  if (statusBadge) {
    if (script.status === 'active') {
      statusBadge.className = 'cartridge-status-badge badge-active';
      statusBadge.innerHTML = '<span class="pulse-dot"></span> 演练中';
    } else if (script.status === 'draft') {
      statusBadge.className = 'cartridge-status-badge badge-draft';
      statusBadge.textContent = '● 草稿';
    } else {
      statusBadge.className = 'cartridge-status-badge badge-disabled';
      statusBadge.textContent = '● 未启用';
    }
  }

  // 默认激活第一个阶段
  currentActiveStageId = script.stages && script.stages.length > 0 ? script.stages[0].id : null;

  // 渲染中间红蓝对抗平铺矩阵 (完全不折叠！)
  renderCenterTimelineTree();

  // 渲染左翼与右翼
  renderLeftRedCamp();
  renderRightBlueCamp();

  // 实时重新核算公信力天平
  recalculateCredibilityBalance();
}

function onVirtualDurationChange(val) {
  if (currentWorkbenchScript) {
    currentWorkbenchScript.virtualDuration = Number(val);
    showToast(`⏱️ 演练真实时长已设定为: ${val} 分钟`, 'info');
    renderScriptTable();
  }
}

function onDifficultyChange(diff) {
  if (currentWorkbenchScript) {
    currentWorkbenchScript.difficulty = diff;
    showToast(`演练难度已切换为: ${diff.toUpperCase()}！发酵系数已自适应调整。`, 'info');
  }
}

// 实时公信力天平核算 (基于红方所有施压负分与蓝方所有应对正分动态核算，支持单进攻无防守/多防守走向)
function recalculateCredibilityBalance() {
  if (!currentWorkbenchScript || !currentWorkbenchScript.stages) return;

  const baseline = currentWorkbenchScript.credibilityBaseline || 100;
  let totalDelta = 0;

  currentWorkbenchScript.stages.forEach(stg => {
    // 遍历本环节对抗矩阵中的所有红方扣分与蓝方加分
    const confrontations = stg.confrontations || [];
    if (confrontations.length > 0) {
      confrontations.forEach(c => {
        if (c.red && typeof c.red.penalty === 'number') totalDelta += c.red.penalty;
        const blues = c.blues ? c.blues : (c.blue ? [c.blue] : []);
        blues.forEach(b => {
          if (typeof b.delta === 'number') totalDelta += b.delta;
        });
      });
    } else {
      // 备用：基于走向
      const chosenKey = stg.selectedBranch || 'branch_a';
      const measure = stg.blueCamp?.measures?.find(m => m.branchKey === chosenKey);
      if (measure) totalDelta += Number(measure.delta || 0);
    }
  });

  const finalScore = baseline + totalDelta;

  // 归一化进度条刻度 (0分 -> 5%, 50分 -> 25%, 80分 -> 50%, 100分 -> 70%, 150分 -> 98%)
  let percent = 50;
  if (finalScore <= 50) percent = Math.max(5, (finalScore / 50) * 25);
  else if (finalScore <= 80) percent = 25 + ((finalScore - 50) / 30) * 25;
  else if (finalScore <= 100) percent = 50 + ((finalScore - 80) / 20) * 25;
  else percent = Math.min(96, 75 + ((finalScore - 100) / 50) * 21);

  const pointer = document.getElementById('scalePointer');
  const pointerLabel = document.getElementById('pointerScoreVal');
  const scoreText = document.getElementById('wbProjectedScore');

  if (pointer) pointer.style.left = `${percent}%`;
  if (pointerLabel) pointerLabel.textContent = `${finalScore} 分`;

  if (scoreText) {
    let rating = '优秀';
    let color = 'var(--success)';
    if (finalScore < 60) { rating = '严重危机 (不合格)'; color = 'var(--danger)'; }
    else if (finalScore < 80) { rating = '警戒状态 (合格)'; color = 'var(--warning)'; }
    else if (finalScore >= 100) { rating = '卓越担当 (标杆)'; color = '#2563eb'; }

    scoreText.textContent = `${finalScore} 分 (评级: ${rating})`;
    scoreText.style.color = color;
  }
}

// ==================== 4.1 中间：全要素红蓝对战矩阵 (完全平铺不折叠！先红后蓝，自由组合与移除) ====================

function renderCenterTimelineTree() {
  const container = document.getElementById('centerTimelineTreeContainer');
  const pillsContainer = document.getElementById('stageQuickNavPills');
  if (!container || !currentWorkbenchScript) return;

  const stages = currentWorkbenchScript.stages || [];
  if (stages.length === 0) {
    container.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:30px;">暂无演练阶段，请点击右上角【+ 新增推进阶段】开始创建。</div>`;
    if (pillsContainer) pillsContainer.innerHTML = '';
    return;
  }

  // 渲染顶部阶段快速直达卡片
  if (pillsContainer) {
    pillsContainer.innerHTML = stages.map((stg, idx) => {
      const isActive = stg.id === currentActiveStageId;
      return `
        <button class="btn-default" style="padding:2px 7px; font-size:11px; ${isActive ? 'background:var(--primary); color:#fff; font-weight:700; border-color:var(--primary);' : ''}" onclick="scrollToStage('${stg.id}')">
          阶段 ${idx + 1}
        </button>
      `;
    }).join('');
  }

  // 严格要求：页面展示完全不要折叠！全平铺展开展示每一个阶段的所有红蓝对抗项
  container.innerHTML = stages.map((stg, idx) => {
    const isActive = stg.id === currentActiveStageId;
    const confrontations = stg.confrontations || [];

    // 渲染红蓝成对攻防项 (先红后蓝，支持单进攻无防守、一进攻多防守、自由移除)
    const confrontationsHtml = confrontations.map((c, cIdx) => {
      const redPenalty = c.red?.penalty || -15;
      const blues = c.blues ? c.blues : (c.blue ? [c.blue] : []);
      
      let totalBlueDelta = 0;
      blues.forEach(b => { totalBlueDelta += Number(b.delta || 0); });
      const netDelta = redPenalty + totalBlueDelta;

      // 红方素材关联
      let redMediaHtml = '';
      if (c.red?.assetId === 'AST-001') {
        redMediaHtml = `<div class="combat-media-chip" onclick="event.stopPropagation(); playVideoModal('AST-001')">🎬 播放《高层爆燃实况视频.mp4》</div>`;
      } else if (c.red?.assetId) {
        redMediaHtml = `<div class="combat-media-chip" onclick="event.stopPropagation(); showToast('预览关联素材物证', 'info')">🖼️ 附件: ${c.red.assetName || '现场隐患物证'}</div>`;
      }

      // 蓝方防御内容：0个防守(待处置)、1个防守或多个防守走向
      let defensesHtml = '';
      if (blues.length === 0) {
        // 只有进攻没有防守
        defensesHtml = `
          <div class="combat-card-unhandled">
            <div class="unhandled-badge">⚠️ 待处置应对 (持续发酵扣分中)</div>
            <div style="font-size:11.5px; color:#64748b; line-height:1.4;">
              当前红方施压尚未获得官方防守，公信力持续受损。可从右侧拖入措施或点击下方添加。
            </div>
            <button class="btn-primary" style="padding:2px 8px; font-size:11px;" onclick="event.stopPropagation(); openAddDefenseModalForCf('${stg.id}', '${c.id}')">
              + 追加防守措施走向
            </button>
          </div>
        `;
      } else {
        // 一个进攻一个或多个防守走向
        const defenseItemsHtml = blues.map(b => {
          let blueDocHtml = '';
          if (b.docAssetId === 'AST-DOC-01' || b.templateId === 'AST-DOC-01') {
            blueDocHtml = `<div class="combat-media-chip" style="background:#eff6ff; color:#1d4ed8; margin-top:3px;" onclick="event.stopPropagation(); viewOfficialDocModal('AST-DOC-01')">📄 【通报模版】《火灾搜救与基本情况通报》全文</div>`;
          } else if (b.docAssetId === 'AST-DOC-02' || b.templateId === 'AST-DOC-02') {
            blueDocHtml = `<div class="combat-media-chip" style="background:#eff6ff; color:#1d4ed8; margin-top:3px;" onclick="event.stopPropagation(); viewOfficialDocModal('AST-DOC-02')">📄 【通报模版】《K市公安局P区分局警情通报》全文</div>`;
          }

          // 类别标签
          let catBadge = '<span class="measure-category-tag cat-field">🛡️ 应急协同</span>';
          if (b.category === 'diandian_dispatch') catBadge = '<span class="measure-category-tag cat-dispatch">📨 点点迷信指令</span>';
          else if (b.category === 'diandian_reply') catBadge = '<span class="measure-category-tag cat-reply">💬 点点迷信回复</span>';
          else if (b.category === 'official_notice') catBadge = '<span class="measure-category-tag cat-notice">📄 官方通报发布</span>';
          else if (b.category === 'media_interview') catBadge = '<span class="measure-category-tag cat-interview">🎤 突发采访应对</span>';
          else if (b.category === 'press_conf') catBadge = '<span class="measure-category-tag cat-press">📢 新闻发布会</span>';

          const bDelta = Number(b.delta || 0);

          return `
            <div class="combat-card-blue" id="defense_card_${b.id}">
              <div class="combat-card-header">
                <span class="combat-role-name-blue">
                  <span>🏛️</span> <strong>${b.role || '协同机构'}</strong>
                  ${catBadge}
                </span>
                <div style="display:flex; align-items:center; gap:4px;">
                  <span class="delta-badge ${bDelta >= 0 ? 'delta-positive' : 'delta-negative'}">
                    ${bDelta >= 0 ? '+' : ''}${bDelta} 分
                  </span>
                  <button class="btn-default" style="padding:1px 6px; font-size:10.5px;" onclick="event.stopPropagation(); openEditBlueMeasureModal('${b.id}', '${stg.id}', '${c.id}')" title="修改此防守措施">
                    ✏️ 修改
                  </button>
                  <button class="btn-remove-cf" onclick="event.stopPropagation(); removeDefenseMeasure('${stg.id}', '${c.id}', '${b.id}')" title="移除此项防守措施">
                    ✖ 移除防守
                  </button>
                </div>
              </div>
              <div class="combat-card-body">
                <div style="display:flex; align-items:center; gap:6px; margin-bottom:2px;">
                  <strong style="color:#1e3a8a; font-size:11.5px;">${b.title || ''}</strong>
                  <span class="branch-flow-pill">${b.branchName || '应对走向'}</span>
                </div>
                ${b.statement ? `<div class="combat-statement-quote">${b.statement}</div>` : ''}
              </div>
              ${blueDocHtml}
            </div>
          `;
        }).join('');

        defensesHtml = `
          ${defenseItemsHtml}
          <div style="display:flex; justify-content:flex-end;">
            <button class="btn-link" style="font-size:11px; padding:0;" onclick="event.stopPropagation(); openAddDefenseModalForCf('${stg.id}', '${c.id}')">
              + 追加防守走向分支
            </button>
          </div>
        `;
      }

      // 中部 VS 连接器
      let connectorHtml = '';
      if (blues.length === 0) {
        connectorHtml = `
          <div class="combat-connector">
            <div class="vs-circle" style="background:#dc2626;">VS</div>
            <span class="net-delta-pill delta-negative" style="background:#fef2f2; color:#dc2626;">
              未防守 ${redPenalty}分
            </span>
          </div>
        `;
      } else {
        connectorHtml = `
          <div class="combat-connector">
            <div class="vs-circle">VS</div>
            <span class="net-delta-pill ${netDelta >= 0 ? 'delta-positive' : 'delta-negative'}">
              ${netDelta >= 0 ? '+' : ''}${netDelta}分
            </span>
          </div>
        `;
      }

      return `
        <div class="confrontation-matrix-item" id="cf_item_${c.id}">
          <!-- 左侧：红方舆情施压与发酵 -->
          <div class="combat-card-red">
            <div class="combat-card-header">
              <span class="combat-role-name-red">
                <span>👤</span> <strong>${c.red?.role || '红方角色'}</strong>
                <span style="font-size:10px; color:#b91c1c; background:#fee2e2; padding:1px 4px; border-radius:3px;">${c.red?.platform || '网络'}</span>
              </span>
              <div style="display:flex; align-items:center; gap:4px;">
                <span class="delta-badge delta-negative">公信力 ${redPenalty} 分</span>
                <button class="btn-default" style="padding:1px 6px; font-size:10.5px;" onclick="event.stopPropagation(); openEditRedPostModal('${c.red?.id}', '${stg.id}', '${c.id}')" title="修改此进攻帖文">
                  ✏️ 修改
                </button>
                <button class="btn-remove-cf" onclick="event.stopPropagation(); removeConfrontationItem('${stg.id}', '${c.id}')" title="移除此进攻对抗项">
                  ✖ 移除进攻
                </button>
              </div>
            </div>
            <div class="combat-card-body">${c.red?.content || ''}</div>
            ${redMediaHtml}
          </div>

          <!-- 中部：攻防碰撞连接器 -->
          ${connectorHtml}

          <!-- 右侧：蓝方对应处置响应 (支持1个或多个防守走向) -->
          <div class="combat-defenses-col">
            ${defensesHtml}
          </div>
        </div>
      `;
    }).join('');

    const timeTagDisplay = stg.timeTag || (stg.startTime && stg.endTime ? `${stg.startTime.slice(5)} ~ ${stg.endTime.slice(5)}` : '进行中');

    return `
      <div class="stage-expanded-block ${isActive ? 'active-stage' : ''}" id="stage_block_${stg.id}" onclick="selectActiveStage('${stg.id}')">
        <!-- 阶段抬头 (不折叠，常驻显示，支持点击卡片切换) -->
        <div class="stage-block-header">
          <div class="stage-block-title-wrap">
            <span class="stage-num-badge">阶段 ${idx + 1}</span>
            <span class="stage-block-title">${stg.name}</span>
            <span class="stage-block-time-badge">${timeTagDisplay}</span>
          </div>
          <div class="stage-header-actions" style="display:flex; align-items:center; gap:5px;">
            <button class="btn-default" style="padding:2px 7px; font-size:11px;" onclick="event.stopPropagation(); openEditStageModal('${stg.id}')">
              ✏️ 编辑阶段
            </button>
            <button class="btn-link-danger" style="font-size:11px; padding:2px 5px;" onclick="event.stopPropagation(); deleteStage('${stg.id}')">
              🗑️ 删除阶段
            </button>
            <button class="btn-default" style="padding:2px 7px; font-size:11px;" onclick="event.stopPropagation(); selectActiveStage('${stg.id}')">
              ${isActive ? '● 正在编辑中' : '切换为此阶段'}
            </button>
          </div>
        </div>

        <!-- 阶段背景情境概述 -->
        <div class="stage-block-desc">
          📌 <strong>推演情境与阶段目标</strong>：${stg.summary || '推进火灾舆情红蓝博弈演练'}
        </div>

        <!-- 核心对抗矩阵 (完全展开，先红后蓝) -->
        <div class="paired-combat-container">
          ${confrontationsHtml || '<div style="font-size:12px; color:var(--text-muted); text-align:center; padding:12px; border:1px dashed #cbd5e1; border-radius:4px;">暂无攻防项，可从左右两边拖入红方进攻或蓝方措施，自由建立攻防矩阵</div>'}
        </div>

        <!-- 阶段拖拽放置区 (支持左右两侧拖入) -->
        <div class="stage-dropzone" 
             ondragover="handleDragOver(event)" 
             ondragleave="handleDragLeave(event)" 
             ondrop="handleDropStage(event, '${stg.id}')"
             onclick="selectActiveStage('${stg.id}')">
          📥 <strong>拖拽或推入区域</strong>：按住左侧红方贴文或右侧蓝方应对措施拖入此处，自由组合进攻与防守 (支持仅进攻、或一进攻多防守)
        </div>
      </div>
    `;
  }).join('');
}

function selectActiveStage(stageId) {
  currentActiveStageId = stageId;
  renderCenterTimelineTree();
  renderLeftRedCamp();
  renderRightBlueCamp();
}

function scrollToStage(stageId) {
  selectActiveStage(stageId);
  const el = document.getElementById(`stage_block_${stageId}`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('active-stage');
  }
}

// ==================== 4.1.1 阶段增删改与跨天起止时间控制 ====================

function openAddStageModal() {
  const count = (currentWorkbenchScript?.stages?.length || 0) + 1;
  const idInput = document.getElementById('stageEditId');
  const nameInput = document.getElementById('stageEditName');
  const startInput = document.getElementById('stageEditStartTime');
  const endInput = document.getElementById('stageEditEndTime');
  const sumInput = document.getElementById('stageEditSummary');
  const titleEl = document.getElementById('stageModalTitle');

  if (titleEl) titleEl.textContent = '新增演练推进阶段 (支持跨天设置)';
  if (idInput) idInput.value = '';
  if (nameInput) nameInput.value = `阶段${count}：推进环节名称`;
  if (startInput) startInput.value = '2026-04-09T08:00';
  if (endInput) endInput.value = '2026-04-09T18:00';
  if (sumInput) sumInput.value = '各处置机构协同响应与红方舆论博弈发酵情境。';

  calculateStageCrossDay();
  openModal('modal_edit_stage');
}

function openEditStageModal(stageId) {
  const stage = currentWorkbenchScript?.stages?.find(s => s.id === stageId);
  if (!stage) return;

  const idInput = document.getElementById('stageEditId');
  const nameInput = document.getElementById('stageEditName');
  const startInput = document.getElementById('stageEditStartTime');
  const endInput = document.getElementById('stageEditEndTime');
  const sumInput = document.getElementById('stageEditSummary');
  const titleEl = document.getElementById('stageModalTitle');

  if (titleEl) titleEl.textContent = `编辑阶段 [${stage.name}] (支持跨天设置)`;
  if (idInput) idInput.value = stage.id;
  if (nameInput) nameInput.value = stage.name;
  
  // 转换日期格式为 datetime-local (YYYY-MM-DDTHH:mm)
  let sTime = stage.startTime ? stage.startTime.replace(' ', 'T') : '2026-04-08T18:57';
  let eTime = stage.endTime ? stage.endTime.replace(' ', 'T') : '2026-04-08T19:30';
  if (startInput) startInput.value = sTime;
  if (endInput) endInput.value = eTime;
  if (sumInput) sumInput.value = stage.summary || '';

  calculateStageCrossDay();
  openModal('modal_edit_stage');
}

function calculateStageCrossDay() {
  const startVal = document.getElementById('stageEditStartTime')?.value;
  const endVal = document.getElementById('stageEditEndTime')?.value;
  const textEl = document.getElementById('stageCrossDayText');
  const badgeWrap = document.getElementById('stageCrossDayBadgeWrap');
  if (!startVal || !endVal || !textEl) return;

  const startDate = new Date(startVal);
  const endDate = new Date(endVal);
  const diffMs = endDate.getTime() - startDate.getTime();

  if (diffMs < 0) {
    textEl.innerHTML = '<span style="color:#dc2626;">⚠️ 结束时间早于开始时间，请重新调整！</span>';
    if (badgeWrap) badgeWrap.style.background = '#fef2f2';
    return;
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  const startDay = startVal.slice(0, 10);
  const endDay = endVal.slice(0, 10);
  const isCrossDay = startDay !== endDay;

  if (isCrossDay) {
    textEl.innerHTML = `🌙 <strong>跨天设置</strong>：跨越日期推演 (从 ${startDay} 到 ${endDay}，历时 ${hours}小时${minutes}分)`;
    if (badgeWrap) {
      badgeWrap.style.background = '#f5f3ff';
      badgeWrap.style.borderColor = '#c4b5fd';
      badgeWrap.style.color = '#6d28d9';
    }
  } else {
    textEl.innerHTML = `🕒 <strong>当日推演</strong>：历时 ${hours}小时${minutes}分 (${startDay})`;
    if (badgeWrap) {
      badgeWrap.style.background = '#eff6ff';
      badgeWrap.style.borderColor = '#bfdbfe';
      badgeWrap.style.color = '#1d4ed8';
    }
  }
}

function submitSaveStage() {
  const stageId = document.getElementById('stageEditId')?.value?.trim();
  const name = document.getElementById('stageEditName')?.value?.trim();
  const startVal = document.getElementById('stageEditStartTime')?.value;
  const endVal = document.getElementById('stageEditEndTime')?.value;
  const summary = document.getElementById('stageEditSummary')?.value?.trim() || '';

  if (!name) {
    showToast('请输入阶段名称！', 'warning');
    return;
  }
  if (!startVal || !endVal) {
    showToast('请完整指定阶段开始时间与结束时间！', 'warning');
    return;
  }

  const sDate = new Date(startVal);
  const eDate = new Date(endVal);
  if (eDate.getTime() < sDate.getTime()) {
    showToast('阶段结束时间不能早于开始时间！', 'warning');
    return;
  }

  const isCross = startVal.slice(0, 10) !== endVal.slice(0, 10);
  const sStr = startVal.replace('T', ' ');
  const eStr = endVal.replace('T', ' ');
  const timeTag = isCross ? `🌙 跨天 ${sStr.slice(5)} ~ ${eStr.slice(5)}` : `${sStr.slice(5)} ~ ${eStr.slice(11)}`;

  if (stageId) {
    // 编辑现有阶段
    const stage = currentWorkbenchScript?.stages?.find(s => s.id === stageId);
    if (stage) {
      stage.name = name;
      stage.startTime = sStr;
      stage.endTime = eStr;
      stage.isCrossDay = isCross;
      stage.timeTag = timeTag;
      stage.summary = summary;
      showToast(`✅ 阶段 [${name}] 更新成功！(跨天配置已保存)`, 'success');
    }
  } else {
    // 新增阶段
    const newId = 'STAGE-0' + (currentWorkbenchScript.stages.length + 1);
    const newStage = {
      id: newId,
      name: name,
      startTime: sStr,
      endTime: eStr,
      isCrossDay: isCross,
      timeTag: timeTag,
      summary: summary,
      confrontations: [],
      redCamp: {
        roles: [{ id: 'R-NEW-1', name: '网络热议网民群', active: true }],
        posts: [],
        assets: []
      },
      blueCamp: {
        roles: [{ id: 'B-NEW-1', name: '现场应急指挥部', active: true }],
        measures: [],
        statements: []
      }
    };
    currentWorkbenchScript.stages.push(newStage);
    currentActiveStageId = newId;
    showToast(`🎉 成功添加新阶段 [${name}]！支持随时配置红蓝走向。`, 'success');
  }

  closeModal('modal_edit_stage');
  renderCenterTimelineTree();
  renderLeftRedCamp();
  renderRightBlueCamp();
  renderScriptTable();
}

function deleteStage(stageId) {
  if (!currentWorkbenchScript || !currentWorkbenchScript.stages) return;
  if (currentWorkbenchScript.stages.length <= 1) {
    showToast('演练剧本至少需要保留一个推进阶段！', 'warning');
    return;
  }

  const stage = currentWorkbenchScript.stages.find(s => s.id === stageId);
  const stageName = stage ? stage.name : stageId;

  if (confirm(`确定删除推进环节【${stageName}】及其所有攻防数据？此操作不可恢复。`)) {
    currentWorkbenchScript.stages = currentWorkbenchScript.stages.filter(s => s.id !== stageId);
    if (currentActiveStageId === stageId) {
      currentActiveStageId = currentWorkbenchScript.stages[0]?.id || null;
    }
    showToast(`已删除环节【${stageName}】！`, 'info');
    renderCenterTimelineTree();
    renderLeftRedCamp();
    renderRightBlueCamp();
    recalculateCredibilityBalance();
    renderScriptTable();
  }
}

// ==================== 4.1.2 攻防项与走向分支的自由移除与追加 ====================

// 移除整条攻防项 (包括红方进攻)
function removeConfrontationItem(stageId, cfId) {
  const stage = currentWorkbenchScript?.stages?.find(s => s.id === stageId);
  if (!stage || !stage.confrontations) return;

  stage.confrontations = stage.confrontations.filter(c => c.id !== cfId);
  renderCenterTimelineTree();
  recalculateCredibilityBalance();
  showToast('已从该阶段中移除该项对抗！', 'info');
}

// 移除单个防守应对措施走向
function removeDefenseMeasure(stageId, cfId, defenseId) {
  const stage = currentWorkbenchScript?.stages?.find(s => s.id === stageId);
  if (!stage || !stage.confrontations) return;

  const cf = stage.confrontations.find(c => c.id === cfId);
  if (!cf) return;

  if (cf.blues) {
    cf.blues = cf.blues.filter(b => b.id !== defenseId);
  }
  if (cf.blue && cf.blue.id === defenseId) {
    cf.blue = null;
  }

  renderCenterTimelineTree();
  recalculateCredibilityBalance();
  showToast('已移除该项防守应对措施，事态走向已自适应更新！', 'info');
}

// 打开为指定红方进攻追加防守弹窗
function openAddDefenseModalForCf(stageId, cfId) {
  const stage = currentWorkbenchScript?.stages?.find(s => s.id === stageId);
  if (!stage) return;
  const cf = stage.confrontations?.find(c => c.id === cfId);
  if (!cf) return;

  document.getElementById('targetCfStageId').value = stageId;
  document.getElementById('targetCfId').value = cfId;

  const previewEl = document.getElementById('targetCfRedPreview');
  if (previewEl) {
    previewEl.innerHTML = `<strong>${cf.red?.role || '红方角色'}</strong> (${cf.red?.platform || '网络'}): ${cf.red?.content || ''} <span style="color:#dc2626;">(扣除 ${cf.red?.penalty || -15} 分)</span>`;
  }

  // 加载该阶段蓝方措施库下拉项
  const selectEl = document.getElementById('cfQuickMeasureSelect');
  if (selectEl) {
    const measures = stage.blueCamp?.measures || [];
    selectEl.innerHTML = `
      <option value="">-- 选择现有处置措施库中的措施 --</option>
      ${measures.map(m => `<option value="${m.id}">[${m.role}] ${m.title} (${Number(m.delta) >= 0 ? '+' : ''}${m.delta}分)</option>`).join('')}
    `;
  }

  // 清空快速录入输入框
  const titleInput = document.getElementById('cfNewDefenseTitle');
  if (titleInput) titleInput.value = '';

  openModal('modal_add_defense_to_cf');
}

function onCfQuickMeasureSelected(measureId) {
  if (!measureId) return;
  const stageId = document.getElementById('targetCfStageId')?.value;
  const stage = currentWorkbenchScript?.stages?.find(s => s.id === stageId);
  const measure = stage?.blueCamp?.measures?.find(m => m.id === measureId);
  if (measure) {
    const titleInput = document.getElementById('cfNewDefenseTitle');
    const roleInput = document.getElementById('cfNewDefenseRole');
    const deltaSelect = document.getElementById('cfNewDefenseDelta');
    const branchInput = document.getElementById('cfNewDefenseBranch');
    if (titleInput) titleInput.value = measure.title;
    if (roleInput) roleInput.value = measure.role;
    if (deltaSelect) deltaSelect.value = measure.delta;
    if (branchInput) branchInput.value = measure.branchName || '走向 (正向应对)';
  }
}

function submitAddDefenseToCf() {
  const stageId = document.getElementById('targetCfStageId')?.value;
  const cfId = document.getElementById('targetCfId')?.value;
  const stage = currentWorkbenchScript?.stages?.find(s => s.id === stageId);
  if (!stage) return;
  const cf = stage.confrontations?.find(c => c.id === cfId);
  if (!cf) return;

  const measureSelectId = document.getElementById('cfQuickMeasureSelect')?.value;
  const customTitle = document.getElementById('cfNewDefenseTitle')?.value?.trim();
  const customRole = document.getElementById('cfNewDefenseRole')?.value?.trim() || '市应急管理局';
  const customDelta = Number(document.getElementById('cfNewDefenseDelta')?.value) || 10;
  const customBranch = document.getElementById('cfNewDefenseBranch')?.value?.trim() || '走向 (有效应对)';

  let defenseObj = null;

  if (measureSelectId) {
    const m = stage.blueCamp?.measures?.find(item => item.id === measureSelectId);
    if (m) {
      defenseObj = {
        id: 'BM-' + Date.now(),
        role: m.role,
        category: m.category || 'field_operation',
        title: m.title,
        statement: m.statement || '',
        docAssetId: m.docAssetId || '',
        templateId: m.templateId || '',
        branchName: m.branchName || '走向 (正向处置)',
        delta: Number(m.delta || 10)
      };
    }
  }

  if (!defenseObj) {
    if (!customTitle) {
      showToast('请选择现有措施或输入防守措施标题！', 'warning');
      return;
    }
    defenseObj = {
      id: 'BM-' + Date.now(),
      role: customRole,
      category: 'field_operation',
      title: customTitle,
      statement: `【处置通报】针对舆情反映情况，${customRole}迅速开展调查处置。`,
      docAssetId: '',
      branchName: customBranch,
      delta: customDelta
    };
  }

  if (!cf.blues) cf.blues = cf.blue ? [cf.blue] : [];
  cf.blues.push(defenseObj);

  closeModal('modal_add_defense_to_cf');
  renderCenterTimelineTree();
  recalculateCredibilityBalance();
  showToast(`🛡️ 已成功为红方进攻追加防守措施走向【${defenseObj.title}】！`, 'success');
}

// ==================== 4.2 左翼红方阵营渲染 (绑定参与角色与负分，支持拖拽) ====================

function renderLeftRedCamp() {
  const currentStage = currentWorkbenchScript?.stages?.find(s => s.id === currentActiveStageId);
  const stageNameEl = document.getElementById('redCurrentStageName');
  if (stageNameEl && currentStage) stageNameEl.textContent = currentStage.name;

  // 1. 环节参与角色
  const rolesContainer = document.getElementById('redActiveRolesContainer');
  if (rolesContainer && currentStage) {
    const roles = currentStage.redCamp?.roles || [];
    rolesContainer.innerHTML = roles.map(r => `
      <div class="role-chip role-chip-red ${r.active ? 'active' : ''}" onclick="toggleRoleActive('red', '${r.id}')">
        <span>${r.active ? '☑' : '☐'}</span>
        <span>${r.name}</span>
      </div>
    `).join('') || '<span style="font-size:12px; color:var(--text-muted);">暂无配置角色</span>';
  }

  // 2. 发帖话术库 (绑定角色、平台与公信力下降负分，支持拖拽/推入)
  const postsContainer = document.getElementById('redPostsListContainer');
  if (postsContainer && currentStage) {
    const posts = currentStage.redCamp?.posts || [];
    postsContainer.innerHTML = posts.map(p => `
      <div class="post-card-item" draggable="true" ondragstart="handleDragStart(event, 'red', '${p.id}', '${currentActiveStageId}')">
        <div class="post-item-head">
          <span class="combat-role-name-red">
            <span>👤</span> <strong>${p.role || p.author}</strong>
            <span style="font-size:10px; color:#b91c1c; background:#fee2e2; padding:1px 3px; border-radius:2px;">${p.platform}</span>
          </span>
          <span class="delta-badge delta-negative">公信力 ${p.penalty || -15} 分</span>
        </div>
        <div class="post-content-text">${p.content}</div>
        <div style="margin-top:8px; display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #fecaca; padding-top:6px;">
          <span style="font-size:10.5px; color:#991b1b; font-weight:600;">[${p.type || '舆情发酵'}]</span>
          <div style="display:flex; align-items:center; gap:4px;">
            <button class="btn-default" style="padding:2px 6px; font-size:11px;" onclick="event.stopPropagation(); openEditRedPostModal('${p.id}', '${currentActiveStageId}')" title="修改此发帖内容">
              ✏️ 修改
            </button>
            <button class="btn-link-danger" style="padding:2px 5px; font-size:11px;" onclick="event.stopPropagation(); deleteRedPost('${p.id}', '${currentActiveStageId}')" title="删除此发帖内容">
              🗑️ 删除
            </button>
            <button class="btn-primary" style="padding:2px 7px; font-size:11px;" onclick="event.stopPropagation(); pushItemToCenterStage('red', '${p.id}', '${currentActiveStageId}')" title="推入对抗矩阵">
              ⚔️ 推入对抗
            </button>
          </div>
        </div>
      </div>
    `).join('') || '<div style="font-size:12px; color:var(--text-muted); padding:6px;">暂无发帖话术</div>';
  }

  // 3. 施压多模态素材
  const assetsContainer = document.getElementById('redAssetsListContainer');
  if (assetsContainer && currentStage) {
    const assetIds = currentStage.redCamp?.assets || [];
    const assets = assetLibrary.filter(a => assetIds.includes(a.id));
    assetsContainer.innerHTML = assets.map(a => `
      <div class="media-item-chip">
        <div style="display:flex; align-items:center; gap:6px; overflow:hidden;">
          <span>${a.category === 'video' ? '🎬' : '🖼️'}</span>
          <span style="font-size:11.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:180px;">${a.name}</span>
        </div>
        <button class="btn-link" onclick="${a.category === 'video' ? `playVideoModal('${a.id}')` : `showToast('预览图片: ${a.name}', 'info')`}">
          ${a.category === 'video' ? '▶ 播放' : '查看'}
        </button>
      </div>
    `).join('') || '<div style="font-size:12px; color:var(--text-muted); padding:6px;">未挂接素材</div>';
  }
}

// ==================== 4.3 右翼蓝方阵营渲染 (处置措施绑定加分与对应回复，支持拖拽) ====================

function renderRightBlueCamp() {
  const currentStage = currentWorkbenchScript?.stages?.find(s => s.id === currentActiveStageId);
  const stageNameEl = document.getElementById('blueCurrentStageName');
  if (stageNameEl && currentStage) stageNameEl.textContent = currentStage.name;

  // 1. 协同处置机构席位
  const rolesContainer = document.getElementById('blueActiveRolesContainer');
  if (rolesContainer && currentStage) {
    const roles = currentStage.blueCamp?.roles || [];
    rolesContainer.innerHTML = roles.map(r => `
      <div class="role-chip role-chip-blue ${r.active ? 'active' : ''}" onclick="toggleRoleActive('blue', '${r.id}')">
        <span>${r.active ? '☑' : '☐'}</span>
        <span>${r.name}</span>
      </div>
    `).join('') || '<span style="font-size:12px; color:var(--text-muted);">暂无指派部门</span>';
  }

  // 2. 处置措施选项池 (绑定正向挽回加分与对应口径回复，支持拖拽/推入)
  const measuresContainer = document.getElementById('blueMeasuresListContainer');
  if (measuresContainer && currentStage) {
    const measures = currentStage.blueCamp?.measures || [];
    measuresContainer.innerHTML = measures.map(m => {
      const isPositive = m.type === 'positive' || (Number(m.delta) >= 0);

      let catBadge = '<span class="measure-category-tag cat-field">🛡️ 应急处置</span>';
      if (m.category === 'diandian_dispatch') catBadge = '<span class="measure-category-tag cat-dispatch">📨 点点迷信指令</span>';
      else if (m.category === 'diandian_reply') catBadge = '<span class="measure-category-tag cat-reply">💬 点点迷信回复</span>';
      else if (m.category === 'official_notice') catBadge = '<span class="measure-category-tag cat-notice">📄 官方通报发布</span>';
      else if (m.category === 'media_interview') catBadge = '<span class="measure-category-tag cat-interview">🎤 突发采访应对</span>';
      else if (m.category === 'press_conf') catBadge = '<span class="measure-category-tag cat-press">📢 新闻发布会</span>';

      return `
        <div class="measure-card-item ${isPositive ? 'is-positive' : 'is-negative'}" draggable="true" ondragstart="handleDragStart(event, 'blue', '${m.id}', '${currentActiveStageId}')">
          <div class="measure-head">
            <span class="combat-role-name-blue">
              <span>🏛️</span> <strong>${m.role || '处置席位'}</strong>
              ${catBadge}
            </span>
            <span class="delta-badge ${isPositive ? 'delta-positive' : 'delta-negative'}">${isPositive ? '+' : ''}${m.delta} 分</span>
          </div>
          <div style="font-size:12px; font-weight:700; color:var(--text-title); margin-bottom:3px;">${m.title}</div>
          <div class="measure-desc-text">${m.desc || ''}</div>
          ${m.statement ? `<div class="combat-statement-quote">${m.statement}</div>` : ''}
          <div style="margin-top:8px; display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #bfdbfe; padding-top:6px;">
            <span style="font-size:10.5px; color:var(--text-muted); font-weight:600;">${m.branchName || '正向处置走向'}</span>
            <div style="display:flex; align-items:center; gap:4px;">
              <button class="btn-default" style="padding:2px 6px; font-size:11px;" onclick="event.stopPropagation(); openEditBlueMeasureModal('${m.id}', '${currentActiveStageId}')" title="修改此处置措施">
                ✏️ 修改
              </button>
              <button class="btn-link-danger" style="padding:2px 5px; font-size:11px;" onclick="event.stopPropagation(); deleteBlueMeasure('${m.id}', '${currentActiveStageId}')" title="删除此处置措施">
                🗑️ 删除
              </button>
              <button class="btn-primary" style="padding:2px 7px; font-size:11px;" onclick="event.stopPropagation(); pushItemToCenterStage('blue', '${m.id}', '${currentActiveStageId}')" title="推入响应矩阵">
                🛡️ 推入响应
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('') || '<div style="font-size:12px; color:var(--text-muted); padding:6px;">暂无措施</div>';
  }

  // 3. 官方权威通报公文模板 (包含两期真实红头文)
  const statementsContainer = document.getElementById('blueStatementsListContainer');
  if (statementsContainer && currentStage) {
    statementsContainer.innerHTML = `
      <div class="media-item-chip" style="cursor:pointer;" onclick="viewOfficialDocModal('AST-DOC-01')">
        <div style="display:flex; align-items:center; gap:6px;">
          <span>📄</span>
          <span style="font-size:11.5px; font-weight:600; color:#1d4ed8;">《火灾搜救与基本情况通报》 (附件一)</span>
        </div>
        <button class="btn-link">查看全文</button>
      </div>
      <div class="media-item-chip" style="cursor:pointer;" onclick="viewOfficialDocModal('AST-DOC-02')">
        <div style="display:flex; align-items:center; gap:6px;">
          <span>📄</span>
          <span style="font-size:11.5px; font-weight:600; color:#1d4ed8;">《K市公安局P区分局警情通报》 (附件二)</span>
        </div>
        <button class="btn-link">查看全文</button>
      </div>
    `;
  }
}

// ==================== 4.4 HTML5 拖拉拖拽与快捷推入引擎 (左右拖入中间自由配对) ====================

let draggedPayload = null;

function handleDragStart(event, camp, itemId, stageId) {
  draggedPayload = { camp, itemId, stageId };
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', JSON.stringify(draggedPayload));
    event.dataTransfer.effectAllowed = 'copy';
  }
}

function handleDragOver(event) {
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
  event.currentTarget.classList.add('drag-over');
}

function handleDragLeave(event) {
  event.currentTarget.classList.remove('drag-over');
}

function handleDropStage(event, targetStageId) {
  event.preventDefault();
  event.currentTarget.classList.remove('drag-over');

  let data = draggedPayload;
  try {
    const raw = event.dataTransfer.getData('text/plain');
    if (raw) data = JSON.parse(raw);
  } catch (e) {}

  if (!data || !data.itemId) return;

  pushItemToCenterStage(data.camp, data.itemId, targetStageId);
}

// 将左侧红方贴文或右侧蓝方措施加入到中间指定阶段对抗矩阵中 (支持单进攻无防守、一进攻多防守)
function pushItemToCenterStage(camp, itemId, stageId) {
  const targetStage = currentWorkbenchScript?.stages?.find(s => s.id === stageId);
  if (!targetStage) return;

  if (!targetStage.confrontations) targetStage.confrontations = [];

  if (camp === 'red') {
    // 找到红方贴文
    const post = targetStage.redCamp?.posts?.find(p => p.id === itemId) || {
      id: itemId,
      role: '抖音网民“云朵儿”',
      platform: '抖音短视频',
      content: '现场突发爆料！',
      penalty: -15
    };

    // 在对抗矩阵中建立对应攻防项 (先有红方进攻，初始可以只有进攻没有防守！)
    const newCfId = 'CF-' + Date.now();
    targetStage.confrontations.push({
      id: newCfId,
      red: {
        id: post.id,
        role: post.role || post.author,
        platform: post.platform,
        content: post.content,
        assetId: post.assetId || '',
        penalty: post.penalty || -15,
        trendingPlatform: post.trendingPlatform || '',
        trendingRank: post.trendingRank || ''
      },
      blues: [] // 只有进攻没有防守！
    });

    showToast(`⚔️ 已将红方角色 [${post.role || post.author}] 的进攻推入【${targetStage.name}】！(待蓝方防守应对)`, 'success');
  } else if (camp === 'blue') {
    // 找到蓝方措施
    const measure = targetStage.blueCamp?.measures?.find(m => m.id === itemId) || {
      id: itemId,
      role: '应急处置指挥席',
      title: '紧急处置应对措施',
      statement: '',
      delta: 10
    };

    const defenseItem = {
      id: 'BM-' + Date.now(),
      role: measure.role || '应急指挥席',
      category: measure.category || 'field_operation',
      title: measure.title,
      statement: measure.statement || '',
      docAssetId: measure.docAssetId || '',
      templateId: measure.templateId || '',
      branchName: measure.branchName || '走向 (正向应对)',
      delta: Number(measure.delta || 10)
    };

    // 优先配对尚未有防守的红方进攻项
    const unhandledCf = targetStage.confrontations.find(c => (!c.blues || c.blues.length === 0));
    if (unhandledCf) {
      if (!unhandledCf.blues) unhandledCf.blues = [];
      unhandledCf.blues.push(defenseItem);
      showToast(`🛡️ 蓝方措施 [${measure.title}] 已成功配对填补红方进攻防线！`, 'success');
    } else if (targetStage.confrontations.length > 0) {
      // 若都已有防守，则追加到最后一个进攻作为多防守走向！
      const lastCf = targetStage.confrontations[targetStage.confrontations.length - 1];
      if (!lastCf.blues) lastCf.blues = lastCf.blue ? [lastCf.blue] : [];
      lastCf.blues.push(defenseItem);
      showToast(`🛡️ 蓝方措施 [${measure.title}] 已作为追加防守分支推入【${targetStage.name}】！`, 'success');
    } else {
      // 没有任何红方项时，自动生成关联对抗项
      targetStage.confrontations.push({
        id: 'CF-' + Date.now(),
        red: {
          id: 'RP-AUTO',
          role: '突发热议网民群',
          platform: '新浪微博',
          content: '居民楼现场秩序受到广泛关注，急需官方回应。',
          penalty: -10
        },
        blues: [defenseItem]
      });
      showToast(`🛡️ 蓝方措施已作为主力响应推入【${targetStage.name}】！`, 'success');
    }
  }

  // 刷新中间展开树与公信力核算
  renderCenterTimelineTree();
  recalculateCredibilityBalance();
}

function toggleRoleActive(camp, roleId) {
  const currentStage = currentWorkbenchScript?.stages?.find(s => s.id === currentActiveStageId);
  if (!currentStage) return;

  const roleList = camp === 'red' ? currentStage.redCamp?.roles : currentStage.blueCamp?.roles;
  const role = roleList?.find(r => r.id === roleId);
  if (role) {
    role.active = !role.active;
    if (camp === 'red') renderLeftRedCamp();
    else renderRightBlueCamp();
    showToast(`已更新角色 [${role.name}] 参演激活状态`, 'info');
  }
}

// 保存工作台草稿 (持久化演练周期、演练时长、时间倍速等)
function saveWorkbenchScriptDraft() {
  if (currentWorkbenchScript) {
    currentWorkbenchScript.name = document.getElementById('wbTopScriptName')?.value || currentWorkbenchScript.name;
    currentWorkbenchScript.startDate = document.getElementById('wbTopStartDate')?.value || currentWorkbenchScript.startDate;
    currentWorkbenchScript.endDate = document.getElementById('wbTopEndDate')?.value || currentWorkbenchScript.endDate;
    currentWorkbenchScript.virtualDuration = Number(document.getElementById('wbTopVirtualDuration')?.value) || currentWorkbenchScript.virtualDuration;
    currentWorkbenchScript.timeSpeed = Number(document.getElementById('wbTopTimeSpeed')?.value) || currentWorkbenchScript.timeSpeed || 5;
    currentWorkbenchScript.updatedAt = new Date().toISOString().slice(0, 16).replace('T', ' ');

    persistCartridges();
    showToast('💾 剧本草稿保存成功！演练周期、演练时长、时间倍速、红蓝全平铺矩阵已同步更新。', 'success');
    renderScriptTable();
    initTopCartridge();
  }
}

function publishWorkbenchScript() {
  if (!currentWorkbenchScript) return;
  currentWorkbenchScript.name = document.getElementById('wbTopScriptName')?.value || currentWorkbenchScript.name;
  currentWorkbenchScript.startDate = document.getElementById('wbTopStartDate')?.value || currentWorkbenchScript.startDate;
  currentWorkbenchScript.endDate = document.getElementById('wbTopEndDate')?.value || currentWorkbenchScript.endDate;
  currentWorkbenchScript.virtualDuration = Number(document.getElementById('wbTopVirtualDuration')?.value) || currentWorkbenchScript.virtualDuration;
  currentWorkbenchScript.timeSpeed = Number(document.getElementById('wbTopTimeSpeed')?.value) || currentWorkbenchScript.timeSpeed || 5;
  currentWorkbenchScript.status = 'active';

  scriptCartridges.forEach(s => {
    if (s.id !== currentWorkbenchScript.id && s.status === 'active') s.status = 'disabled';
  });

  persistCartridges();
  showToast(`🚀 剧本 [${currentWorkbenchScript.id}] 已发布并设为全局演练卡带！大屏、战境及移动端已全量同步。`, 'success');
  initTopCartridge();
  renderScriptTable();
  broadcastActiveCartridgeToSyncEngine(currentWorkbenchScript);
}

function openSimulatePreviewModal() {
  showToast('推演模拟试跑模式已就绪，可随时通过顶栏进入大屏端/PC战境端进行真实推演！', 'info');
}

// ==================== 5. 录入发帖、处置措施与官方公函查看模态框 ====================

function openAddRedPostModal() {
  const editIdInput = document.getElementById('redPostEditId');
  if (editIdInput) editIdInput.value = '';
  const editStageInput = document.getElementById('redPostEditStageId');
  if (editStageInput) editStageInput.value = '';
  const editCfInput = document.getElementById('redPostEditCfId');
  if (editCfInput) editCfInput.value = '';

  const titleEl = document.getElementById('redPostModalTitle');
  if (titleEl) titleEl.textContent = '录入红方发帖 / 网络造谣话术 (绑定角色与负分)';
  const btnEl = document.getElementById('redPostSubmitBtn');
  if (btnEl) btnEl.textContent = '保存并加入红方阵营';

  // 重置素材来源模式
  toggleRedAssetSourceMode('library');
  const contentInput = document.getElementById('redPostContent');
  if (contentInput) contentInput.value = '';
  const trendingPlatform = document.getElementById('redPostTrendingPlatform');
  if (trendingPlatform) trendingPlatform.value = '';
  const trendingRank = document.getElementById('redPostTrendingRank');
  if (trendingRank) trendingRank.value = 'Top 1 (爆)';
  openModal('modal_add_red_post');
}

function openEditRedPostModal(postId, stageId, cfId) {
  const targetStage = currentWorkbenchScript?.stages?.find(s => s.id === (stageId || currentActiveStageId));
  if (!targetStage) return;

  // 查找帖子对象 (在 redCamp.posts 或 confrontations.red 中)
  let post = targetStage.redCamp?.posts?.find(p => p.id === postId);
  if (!post && cfId) {
    const cf = targetStage.confrontations?.find(c => c.id === cfId);
    if (cf && cf.red) post = cf.red;
  }
  if (!post && targetStage.confrontations) {
    const cf = targetStage.confrontations.find(c => c.red?.id === postId);
    if (cf && cf.red) post = cf.red;
  }
  if (!post) {
    showToast('未找到该发帖数据', 'warning');
    return;
  }

  const editIdInput = document.getElementById('redPostEditId');
  if (editIdInput) editIdInput.value = postId;
  const editStageInput = document.getElementById('redPostEditStageId');
  if (editStageInput) editStageInput.value = targetStage.id;
  const editCfInput = document.getElementById('redPostEditCfId');
  if (editCfInput) editCfInput.value = cfId || '';

  const titleEl = document.getElementById('redPostModalTitle');
  if (titleEl) titleEl.textContent = '✏️ 修改红方发帖 / 攻防内容';
  const btnEl = document.getElementById('redPostSubmitBtn');
  if (btnEl) btnEl.textContent = '保存修改';

  const roleSelect = document.getElementById('redPostRoleSelect');
  if (roleSelect) roleSelect.value = post.role || post.author || '';
  const platformSelect = document.getElementById('redPostPlatform');
  if (platformSelect) platformSelect.value = post.platform || '抖音短视频';
  const penaltySelect = document.getElementById('redPostPenaltySelect');
  if (penaltySelect) penaltySelect.value = String(post.penalty || -15);
  const contentInput = document.getElementById('redPostContent');
  if (contentInput) contentInput.value = post.content || '';
  const assetSelect = document.getElementById('redPostAssetSelect');
  if (assetSelect) assetSelect.value = post.assetId || '';
  const trendingPlatform = document.getElementById('redPostTrendingPlatform');
  if (trendingPlatform) trendingPlatform.value = post.trendingPlatform || '';
  const trendingRank = document.getElementById('redPostTrendingRank');
  if (trendingRank) trendingRank.value = post.trendingRank || 'Top 1 (爆)';

  toggleRedAssetSourceMode('library');
  openModal('modal_add_red_post');
}

function deleteRedPost(postId, stageId) {
  const targetStage = currentWorkbenchScript?.stages?.find(s => s.id === (stageId || currentActiveStageId));
  if (!targetStage) return;

  if (!confirm('确定要删除此条红方发帖内容吗？如果中间阶段已推入该发帖，关联的进攻项也将一并清理。')) {
    return;
  }

  if (targetStage.redCamp?.posts) {
    targetStage.redCamp.posts = targetStage.redCamp.posts.filter(p => p.id !== postId);
  }

  if (targetStage.confrontations) {
    targetStage.confrontations = targetStage.confrontations.filter(c => c.red?.id !== postId);
  }

  renderLeftRedCamp();
  renderCenterTimelineTree();
  recalculateCredibilityBalance();
  showToast('🗑️ 已成功删除红方发帖内容！', 'info');
}

function toggleRedAssetSourceMode(mode) {
  const libBox = document.getElementById('redAssetLibrarySelectBox');
  const customBox = document.getElementById('redCustomAssetUploadBox');
  if (mode === 'custom') {
    if (libBox) libBox.style.display = 'none';
    if (customBox) customBox.style.display = 'block';
  } else {
    if (libBox) libBox.style.display = 'block';
    if (customBox) customBox.style.display = 'none';
  }
}

function onCustomFileSelected(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const nameInput = document.getElementById('redCustomAssetName');
    const urlInput = document.getElementById('redCustomAssetUrl');
    if (nameInput && !nameInput.value) {
      nameInput.value = file.name.replace(/\.[^/.]+$/, '');
    }
    if (urlInput) {
      urlInput.value = `./media/${file.name}`;
    }
  }
}

// 录入红方发帖 (支持新增与修改编辑，文案非必填，多模态素材库选择+自定义上传)
function submitAddRedPost() {
  const roleSelect = document.getElementById('redPostRoleSelect');
  const role = roleSelect?.value || '抖音网民“云朵儿”';
  const platform = document.getElementById('redPostPlatform')?.value || '抖音短视频';
  const penalty = Number(document.getElementById('redPostPenaltySelect')?.value) || -15;
  let assetId = document.getElementById('redPostAssetSelect')?.value || '';
  let content = document.getElementById('redPostContent')?.value?.trim() || '';
  const trendingPlatform = document.getElementById('redPostTrendingPlatform')?.value || '';
  const trendingRank = document.getElementById('redPostTrendingRank')?.value || '';

  // 检查是否为自定义上传模式
  const mode = document.querySelector('input[name="redAssetSourceMode"]:checked')?.value || 'library';
  if (mode === 'custom') {
    const customName = document.getElementById('redCustomAssetName')?.value?.trim() || '现场突发多模态物证';
    const customCat = document.getElementById('redCustomAssetCategory')?.value || 'photo';
    const customUrl = document.getElementById('redCustomAssetUrl')?.value?.trim() || './media/fire_material_video.mp4';
    const newAsset = {
      id: 'AST-' + Date.now(),
      name: customName,
      category: customCat,
      url: customUrl,
      source: '红方自定上传',
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };
    assetLibrary.unshift(newAsset);
    assetId = newAsset.id;
    if (!content) {
      content = `[现场发布] 爆料多模态现场素材《${customName}》`;
    }
  }

  // 文案非必填：若未输入文案，根据素材生成默认现场说明
  if (!content) {
    content = assetId ? '【现场实况记录发布】(见关联多模态素材)' : '现场突发情况记录，引发网民广泛关注与跟评。';
  }

  const editId = document.getElementById('redPostEditId')?.value;
  const targetStageId = document.getElementById('redPostEditStageId')?.value || currentActiveStageId;
  const targetCfId = document.getElementById('redPostEditCfId')?.value;
  const targetStage = currentWorkbenchScript?.stages?.find(s => s.id === targetStageId);

  // 【编辑模式】
  if (editId && targetStage) {
    const existingPost = targetStage.redCamp?.posts?.find(p => p.id === editId);
    if (existingPost) {
      existingPost.role = role;
      existingPost.author = role;
      existingPost.platform = platform;
      existingPost.penalty = penalty;
      existingPost.type = penalty <= -20 ? '恶性造谣' : '现场发酵';
      existingPost.content = content;
      existingPost.assetId = assetId;
      existingPost.trendingPlatform = trendingPlatform;
      existingPost.trendingRank = trendingRank;
    }

    // 同步更新对战矩阵中的红方项
    if (targetStage.confrontations) {
      targetStage.confrontations.forEach(c => {
        if (c.red && (c.red.id === editId || (targetCfId && c.id === targetCfId))) {
          c.red.role = role;
          c.red.platform = platform;
          c.red.content = content;
          c.red.assetId = assetId;
          c.red.penalty = penalty;
          c.red.trendingPlatform = trendingPlatform;
          c.red.trendingRank = trendingRank;
        }
      });
    }

    closeModal('modal_add_red_post');
    renderLeftRedCamp();
    renderCenterTimelineTree();
    recalculateCredibilityBalance();
    showToast(`✅ 红方发帖【${role}】修改成功！`, 'success');
    return;
  }

  // 【新增模式】
  if (targetStage && targetStage.redCamp) {
    const newPostId = 'RP-' + Math.floor(100 + Math.random() * 900);
    const newPost = {
      id: newPostId,
      role: role,
      author: role,
      platform: platform,
      type: penalty <= -20 ? '恶性造谣' : '现场发酵',
      penalty: penalty,
      content: content,
      assetId: assetId,
      trendingPlatform: trendingPlatform,
      trendingRank: trendingRank
    };

    targetStage.redCamp.posts.unshift(newPost);

    // 同步把该新发帖推入到中间阶段攻防矩阵中 (先有红方进攻，初始可以只有进攻没有防守！)
    if (!targetStage.confrontations) targetStage.confrontations = [];
    targetStage.confrontations.push({
      id: 'CF-' + Date.now(),
      red: {
        id: newPostId,
        role: role,
        platform: platform,
        content: content,
        assetId: assetId,
        penalty: penalty,
        trendingPlatform: trendingPlatform,
        trendingRank: trendingRank
      },
      blues: [] // 只有进攻没有防守！
    });

    closeModal('modal_add_red_post');
    renderLeftRedCamp();
    renderCenterTimelineTree();
    recalculateCredibilityBalance();
    showToast(`✅ 红方贴文录入成功！已绑定角色 [${role}] 与公信力负分 [${penalty}分]，并加入中间矩阵 (等待蓝方处置)！`, 'success');
  }
}

function openAddBlueMeasureModal() {
  const editIdInput = document.getElementById('blueMeasureEditId');
  if (editIdInput) editIdInput.value = '';
  const editStageInput = document.getElementById('blueMeasureEditStageId');
  if (editStageInput) editStageInput.value = '';
  const editCfInput = document.getElementById('blueMeasureEditCfId');
  if (editCfInput) editCfInput.value = '';

  const titleEl = document.getElementById('blueMeasureModalTitle');
  if (titleEl) titleEl.textContent = '新增蓝方处置响应措施 (对应红方施压)';
  const btnEl = document.getElementById('blueMeasureSubmitBtn');
  if (btnEl) btnEl.textContent = '保存应对措施并加入库';

  const titleInput = document.getElementById('blueMeasureTitle');
  if (titleInput) titleInput.value = '';
  const stmtInput = document.getElementById('blueMeasureStatement');
  if (stmtInput) stmtInput.value = '';
  const targetUnit = document.getElementById('blueMeasureTargetUnit');
  if (targetUnit) targetUnit.value = '';
  const templateSelect = document.getElementById('blueMeasureTemplateSelect');
  if (templateSelect) templateSelect.value = '';
  openModal('modal_add_blue_measure');
}

function openEditBlueMeasureModal(measureId, stageId, cfId) {
  const targetStage = currentWorkbenchScript?.stages?.find(s => s.id === (stageId || currentActiveStageId));
  if (!targetStage) return;

  let measure = targetStage.blueCamp?.measures?.find(m => m.id === measureId);
  if (!measure && targetStage.confrontations) {
    for (const c of targetStage.confrontations) {
      const found = c.blues?.find(b => b.id === measureId);
      if (found) { measure = found; break; }
    }
  }
  if (!measure) {
    showToast('未找到该处置措施数据', 'warning');
    return;
  }

  const editIdInput = document.getElementById('blueMeasureEditId');
  if (editIdInput) editIdInput.value = measureId;
  const editStageInput = document.getElementById('blueMeasureEditStageId');
  if (editStageInput) editStageInput.value = targetStage.id;
  const editCfInput = document.getElementById('blueMeasureEditCfId');
  if (editCfInput) editCfInput.value = cfId || '';

  const titleEl = document.getElementById('blueMeasureModalTitle');
  if (titleEl) titleEl.textContent = '✏️ 修改蓝方处置响应措施';
  const btnEl = document.getElementById('blueMeasureSubmitBtn');
  if (btnEl) btnEl.textContent = '保存修改';

  const titleInput = document.getElementById('blueMeasureTitle');
  if (titleInput) titleInput.value = measure.title || '';
  const catSelect = document.getElementById('blueMeasureCategory');
  if (catSelect) catSelect.value = measure.category || 'field_operation';
  const roleSelect = document.getElementById('blueMeasureRoleSelect');
  if (roleSelect) roleSelect.value = measure.role || '市委网信办监测专班';
  const targetUnit = document.getElementById('blueMeasureTargetUnit');
  if (targetUnit) targetUnit.value = measure.targetUnit || '';
  const templateSelect = document.getElementById('blueMeasureTemplateSelect');
  if (templateSelect) templateSelect.value = measure.templateId || measure.docAssetId || '';
  const branchSelect = document.getElementById('blueMeasureBranchSelect');
  if (branchSelect) branchSelect.value = measure.branchKey || 'positive_a';
  const deltaSelect = document.getElementById('blueMeasureDeltaSelect');
  if (deltaSelect) deltaSelect.value = String(measure.delta || 10);
  const stmtInput = document.getElementById('blueMeasureStatement');
  if (stmtInput) stmtInput.value = measure.statement || '';

  openModal('modal_add_blue_measure');
}

function deleteBlueMeasure(measureId, stageId) {
  const targetStage = currentWorkbenchScript?.stages?.find(s => s.id === (stageId || currentActiveStageId));
  if (!targetStage) return;

  if (!confirm('确定要删除此条蓝方处置措施吗？如果中间阶段已配对该措施，关联的防守也将一并清理。')) {
    return;
  }

  if (targetStage.blueCamp?.measures) {
    targetStage.blueCamp.measures = targetStage.blueCamp.measures.filter(m => m.id !== measureId);
  }

  if (targetStage.confrontations) {
    targetStage.confrontations.forEach(c => {
      if (c.blues) {
        c.blues = c.blues.filter(b => b.id !== measureId);
      }
    });
  }

  renderRightBlueCamp();
  renderCenterTimelineTree();
  recalculateCredibilityBalance();
  showToast('🗑️ 已成功删除该蓝方处置措施！', 'info');
}

function onBlueMeasureCategoryChange(cat) {
  const stmtInput = document.getElementById('blueMeasureStatement');
  if (!stmtInput) return;
  if (cat === 'diandian_dispatch') {
    stmtInput.placeholder = '【点点迷信内部督导指令】要求有关部门于30分钟内精准报送现场火势、伤亡人数及医院收治进展...';
  } else if (cat === 'diandian_reply') {
    stmtInput.placeholder = '【点点迷信情况回复】市卫健委上报：经定点医院核实，12名中轻度呛烟伤员已全部收治无危重...';
  } else if (cat === 'official_notice') {
    stmtInput.placeholder = '【官方通报全文引用】选用附件一情况通报或附件二警情通报，权威公布事故死伤底数及辟谣事实...';
  } else if (cat === 'media_interview') {
    stmtInput.placeholder = '【突发采访现场回应口径】发言人直面红星新闻等记者，澄清搜救通道进展，引导记者至安全专区...';
  } else if (cat === 'press_conf') {
    stmtInput.placeholder = '【新闻发布会主通报辞】常务副区长通报事故调查定性、向遇难同胞默哀、公布生命通道大清障追责举措...';
  }
}

// 新增与修改蓝方处置响应措施 (点点迷信指令/回复、官方通报模版、采访应对、发布会等)
function submitAddBlueMeasure() {
  const title = document.getElementById('blueMeasureTitle')?.value?.trim();
  const category = document.getElementById('blueMeasureCategory')?.value || 'field_operation';
  const role = document.getElementById('blueMeasureRoleSelect')?.value || '市委网信办监测专班';
  const targetUnit = document.getElementById('blueMeasureTargetUnit')?.value?.trim() || '';
  const templateSelect = document.getElementById('blueMeasureTemplateSelect')?.value || '';
  const branchSelect = document.getElementById('blueMeasureBranchSelect')?.value || 'positive_a';
  const delta = Number(document.getElementById('blueMeasureDeltaSelect')?.value) || 10;
  const statement = document.getElementById('blueMeasureStatement')?.value?.trim() || '';

  if (!title) {
    showToast('请输入处置措施标题！', 'warning');
    return;
  }

  const branchName = branchSelect === 'positive_a' ? '走向 A (正向有效应对)' : (branchSelect === 'negative_b' ? '走向 B (迟滞推诿次生风险)' : '走向 C (矛盾激化走向)');
  const editId = document.getElementById('blueMeasureEditId')?.value;
  const targetStageId = document.getElementById('blueMeasureEditStageId')?.value || currentActiveStageId;
  const targetStage = currentWorkbenchScript?.stages?.find(s => s.id === targetStageId);

  // 【编辑模式】
  if (editId && targetStage) {
    const existingMeasure = targetStage.blueCamp?.measures?.find(m => m.id === editId);
    if (existingMeasure) {
      existingMeasure.title = title;
      existingMeasure.category = category;
      existingMeasure.role = role;
      existingMeasure.targetUnit = targetUnit;
      existingMeasure.templateId = templateSelect;
      existingMeasure.docAssetId = templateSelect;
      existingMeasure.branchKey = branchSelect;
      existingMeasure.branchName = branchName;
      existingMeasure.delta = delta;
      existingMeasure.type = delta >= 0 ? 'positive' : 'negative';
      existingMeasure.desc = title;
      existingMeasure.statement = statement;
    }

    // 同步更新对战矩阵中的蓝方项
    if (targetStage.confrontations) {
      targetStage.confrontations.forEach(c => {
        if (c.blues) {
          c.blues.forEach(b => {
            if (b.id === editId) {
              b.title = title;
              b.category = category;
              b.role = role;
              b.statement = statement;
              b.docAssetId = templateSelect;
              b.templateId = templateSelect;
              b.branchName = branchName;
              b.delta = delta;
            }
          });
        }
      });
    }

    closeModal('modal_add_blue_measure');
    renderRightBlueCamp();
    renderCenterTimelineTree();
    recalculateCredibilityBalance();
    showToast(`✅ 蓝方处置措施【${title}】修改成功！`, 'success');
    return;
  }

  // 【新增模式】
  if (targetStage && targetStage.blueCamp) {
    const newId = 'BM-' + Math.floor(100 + Math.random() * 900);
    const newMeasure = {
      id: newId,
      role: role,
      category: category,
      targetUnit: targetUnit,
      templateId: templateSelect,
      docAssetId: templateSelect,
      branchKey: branchSelect,
      title: title,
      type: delta >= 0 ? 'positive' : 'negative',
      delta: delta,
      branchName: branchName,
      desc: title,
      statement: statement
    };

    targetStage.blueCamp.measures.unshift(newMeasure);

    // 配对入中间对抗项：优先寻找当前阶段中尚无防守的红方进攻项！
    if (!targetStage.confrontations) targetStage.confrontations = [];
    const unhandledCf = targetStage.confrontations.find(c => (!c.blues || c.blues.length === 0));

    if (unhandledCf) {
      if (!unhandledCf.blues) unhandledCf.blues = [];
      unhandledCf.blues.push({
        id: newId,
        role: role,
        category: category,
        title: title,
        statement: statement,
        docAssetId: templateSelect,
        templateId: templateSelect,
        branchName: branchName,
        delta: delta
      });
      showToast(`✅ 蓝方处置措施已成功配对填补红方进攻防线！`, 'success');
    } else if (targetStage.confrontations.length > 0) {
      // 若已有防守，追加到最后一个进攻作为多防守分支走向
      const lastCf = targetStage.confrontations[targetStage.confrontations.length - 1];
      if (!lastCf.blues) lastCf.blues = lastCf.blue ? [lastCf.blue] : [];
      lastCf.blues.push({
        id: newId,
        role: role,
        category: category,
        title: title,
        statement: statement,
        docAssetId: templateSelect,
        templateId: templateSelect,
        branchName: branchName,
        delta: delta
      });
      showToast(`✅ 蓝方措施已作为追加防守分支加入！绑定走向 [${branchName}] 与得分 [${delta >= 0 ? '+' : ''}${delta}分]！`, 'success');
    }

    closeModal('modal_add_blue_measure');
    renderRightBlueCamp();
    renderCenterTimelineTree();
    recalculateCredibilityBalance();
  }
}

// 查看火灾事故V6官方红头通报公文全文 (功能 1)
function viewOfficialDocModal(docId) {
  const titleEl = document.getElementById('docModalTitle');
  const bodyEl = document.getElementById('docModalBodyContent');

  if (docId === 'AST-DOC-01') {
    if (titleEl) titleEl.textContent = '📄 附件一：关于P区花园居小区火灾搜救与基本情况通报 (首发通报)';
    if (bodyEl) {
      bodyEl.innerHTML = `
        <div class="redhead-doc-paper">
          <div class="doc-redhead-issuer">K市P区火灾应急处置指挥部文件</div>
          <div class="doc-redhead-badge">内部通报 · 授权发布</div>
          <div class="doc-divider-redline"></div>
          <div class="doc-meta-row">
            <span>发文字号：P区应指发〔2025〕0408号</span>
            <span>签发人：指挥长 (常务副区长)</span>
            <span>时间：2025年4月8日 21:30</span>
          </div>
          <div class="doc-headline-title">关于P区花园居小区火灾搜救与基本情况通报</div>
          <div class="doc-body-p">
            2025年4月8日18时57分，K市P区消防救援大队接到报警：X街道花园居小区23层一栋高层住宅东侧房间突发火灾并伴有爆燃声响。省、市、区主要领导第一时间赶赴现场靠前指挥，应急、消防、公安、卫健及属地街道迅速启动一级应急预案，调集32辆消防车、120名指战员、登高平台消防车及高空侦察无人机开展立体灭火与搜救。
          </div>
          <div class="doc-body-p">
            经全体消防救援指战员与现场应急力量竭力奋战，截至4月8日21时整，现场明火已完全扑灭，搜救工作基本结束。整栋建筑共安全疏散转移撤离居民群众286人。
          </div>
          <div class="doc-body-p">
            经定点医疗救治组会同现场指挥部全面摸排核定：现场共搜救送医伤员21人，均已在第一时间送往市第一人民医院及区定点医院全力救治（其中3人伤情较重，生命体征均平稳）；另有4人经现场及医护人员全力抢救无效不幸罹难。罹难人员身份核验及家属一对一抚慰工作已全面展开。
          </div>
          <div class="doc-body-p">
            目前，省市区联合调查组已正式进驻开展火灾事故原因调查。针对群众反映的小区消防生命通道占用堵塞及建筑内部消防设施等隐患线索，联合调查组与纪检监察部门已依法立案倒查，调查结果将第一时间向全社会公开发布。
          </div>
          <div class="doc-footer-seal-block">
            <div>K市P区火灾应急处置联合指挥部</div>
            <div style="font-size:12.5px; color:#555; margin-top:4px;">2025年4月8日 21时30分</div>
            <div class="doc-seal-stamp">
              <span>★</span>
              <span>K市P区人民政府</span>
              <span>应急指挥部印</span>
            </div>
          </div>
        </div>
      `;
    }
  } else if (docId === 'AST-DOC-02') {
    if (titleEl) titleEl.textContent = '📄 附件二：K市公安局P区分局警情通报 (依法拘留造谣人员)';
    if (bodyEl) {
      bodyEl.innerHTML = `
        <div class="redhead-doc-paper">
          <div class="doc-redhead-issuer">K市公安局P区分局</div>
          <div class="doc-redhead-badge">权威发布 · 警情通报</div>
          <div class="doc-divider-redline"></div>
          <div class="doc-meta-row">
            <span>通报编号：P公通字〔2025〕0409号</span>
            <span>发信单位：网安大队 / 治安大队</span>
            <span>时间：2025年4月9日 11:30</span>
          </div>
          <div class="doc-headline-title">警 情 通 报</div>
          <div class="doc-body-p">
            2025年4月8日晚，我区X街道花园居小区突发火灾事故后，各方救援力量全力以赴投入搜救排险与医疗救治。然而，极个别网民在未经任何核实的情况下，为博取流量关注、博人眼球，故意编造、散布涉灾虚假谣言，引发公众恐慌，严重扰乱社会公共秩序。
          </div>
          <div class="doc-body-p">
            公安机关网安大队连夜顺线侦查，查明以下违法事实：<br>
            <strong>一、违法行为人张某</strong>（男，32岁，抖音账号“小飞飞”），在某媒体报道评论区公然编造散布“我就在对面住，担架都抬了二十多个，应该死了不少人”等不实谣言，点赞评论超数千条；<br>
            <strong>二、违法行为人李某</strong>（女，28岁，微博账号“花花的世界”），在新浪微博大V评论区故意造谣称“一直听到爆炸声，据说死了50人！”，引发跨平台裂变恐慌；<br>
            <strong>三、违法行为人吴某</strong>（男，36岁，账号“K市小马哥”）、<strong>王某</strong>（男，41岁，账号“直击K市现场”），移花接木外地其他治安事件视频，编造“便衣警察押送哭闹维权家属上黑车”谣言，煽动对立情绪。
          </div>
          <div class="doc-body-p">
            经依法传唤审查，违法行为人张某、李某、吴某、王某对其编造、散布涉灾虚假谣言扰乱公共秩序的违法事实供认不讳。根据《中华人民共和国治安管理处罚法》第二十五条第一项之规定，K市公安局P区分局已依法对张某、李某处以行政拘留10日；对吴某、王某处以行政拘留5日的行政处罚。
          </div>
          <div class="doc-body-p">
            <strong>警方严正提醒：</strong>互联网不是法外之地。公安机关将以“零容忍”态度严厉打击网络造谣传谣行为。请广大网民以官方权威通报为准，自觉做到不造谣、不信谣、不传谣，共同维护风清气正的网络空间！
          </div>
          <div class="doc-footer-seal-block">
            <div>K市公安局P区分局</div>
            <div style="font-size:12.5px; color:#555; margin-top:4px;">2025年4月9日 11时30分</div>
            <div class="doc-seal-stamp">
              <span>★</span>
              <span>K市公安局</span>
              <span>P区分局印</span>
            </div>
          </div>
        </div>
      `;
    }
  }

  openModal('modal_view_official_doc');
}

// 筛选挂接素材
let currentAttachTargetCamp = 'red';
function openAttachAssetModal(camp) {
  currentAttachTargetCamp = camp;
  const titleEl = document.getElementById('attachAssetModalTitle');
  if (titleEl) titleEl.textContent = camp === 'red' ? '为红方进攻阵营筛选挂接素材' : '为蓝方处置阵营绑定佐证公文';

  const container = document.getElementById('attachAssetPickerList');
  if (container) {
    container.innerHTML = assetLibrary.map(item => `
      <label style="display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border:1px solid #e2e8f0; border-radius:4px; margin-bottom:8px; cursor:pointer;">
        <div style="display:flex; align-items:center; gap:8px;">
          <input type="checkbox" value="${item.id}" class="attach-chk">
          <div>
            <strong>${item.name}</strong>
            <div style="font-size:11px; color:var(--text-muted);">${item.catName} · ${item.format} · ${item.size}</div>
          </div>
        </div>
        <span style="font-size:11px; background:#eff6ff; color:#2563eb; padding:2px 6px; border-radius:3px;">${item.category}</span>
      </label>
    `).join('');
  }
  openModal('modal_attach_asset');
}

function confirmAttachSelectedAssets() {
  const checkBoxes = document.querySelectorAll('.attach-chk:checked');
  const selectedIds = Array.from(checkBoxes).map(c => c.value);

  const currentStage = currentWorkbenchScript?.stages?.find(s => s.id === currentActiveStageId);
  if (currentStage) {
    if (currentAttachTargetCamp === 'red' && currentStage.redCamp) {
      currentStage.redCamp.assets = Array.from(new Set([...currentStage.redCamp.assets, ...selectedIds]));
      renderLeftRedCamp();
    } else if (currentAttachTargetCamp === 'blue' && currentStage.blueCamp) {
      selectedIds.forEach(id => {
        const item = assetLibrary.find(a => a.id === id);
        if (item) currentStage.blueCamp.statements.push(item.name);
      });
      renderRightBlueCamp();
    }
    showToast(`成功挂接 ${selectedIds.length} 项素材至当前环节！`, 'success');
  }
  closeModal('modal_attach_asset');
}

function openAddRoleModal(camp) {
  const name = prompt(camp === 'red' ? '请输入新增红方攻击角色名称 (如：抖音自媒体小马哥)' : '请输入新增蓝方处置席位名称 (如：市卫健委救治组)');
  if (name) {
    const currentStage = currentWorkbenchScript?.stages?.find(s => s.id === currentActiveStageId);
    if (currentStage) {
      const list = camp === 'red' ? currentStage.redCamp.roles : currentStage.blueCamp.roles;
      list.push({ id: 'R-' + Date.now(), name: name, active: true });
      if (camp === 'red') renderLeftRedCamp();
      else renderRightBlueCamp();
      showToast(`角色 [${name}] 已添加至本环节参演列表！`, 'success');
    }
  }
}

// ==================== 6. 案例库与素材库辅助视图 ====================

function renderCaseArchiveList() {
  const container = document.getElementById('caseArchiveGridContainer');
  if (!container) return;

  container.innerHTML = caseArchiveList.map(item => `
    <div class="case-card">
      <div>
        <div class="case-card-header">
          <div>
            <span style="font-size:11px; background:#e0f2fe; color:#0284c7; padding:2px 6px; border-radius:3px; font-weight:600;">${item.code}</span>
            <div class="case-card-title" style="margin-top:4px;">${item.title}</div>
          </div>
          <span style="font-size:11.5px; color:#16a34a; font-weight:600;">${item.parseStatus}</span>
        </div>
        <div style="font-size:12px; color:var(--text-muted); margin-bottom:8px;">${item.industry} · 大小: ${item.fileSize}</div>
        <div style="font-size:12.5px; color:var(--text-body); line-height:1.6;">${item.desc}</div>
      </div>
      <div style="border-top:1px solid #edf2f7; padding-top:10px; margin-top:12px; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:11px; color:var(--text-muted);">支撑多分支推演</span>
        <button class="btn-primary" style="font-size:12px; padding:4px 10px;" onclick="openDeriveWizardModal()">✨ 以此派生剧本</button>
      </div>
    </div>
  `).join('');
}

function renderAssetVaultGrid() {
  const container = document.getElementById('assetVaultDisplayGrid');
  if (!container) return;

  const filtered = assetLibrary.filter(item => (currentAssetCategory === 'all') || (item.category === currentAssetCategory));

  if (document.getElementById('cntAll')) document.getElementById('cntAll').textContent = assetLibrary.length;
  if (document.getElementById('cntVideo')) document.getElementById('cntVideo').textContent = assetLibrary.filter(a => a.category === 'video').length;
  if (document.getElementById('cntImage')) document.getElementById('cntImage').textContent = assetLibrary.filter(a => a.category === 'image').length;
  if (document.getElementById('cntDoc')) document.getElementById('cntDoc').textContent = assetLibrary.filter(a => a.category === 'doc').length;

  container.innerHTML = filtered.map(item => {
    let clickAction = `showToast('预览素材: ${item.name}', 'info')`;
    let actionBtnText = '查看';
    if (item.category === 'video') {
      clickAction = `playVideoModal('${item.id}')`;
      actionBtnText = '▶ 播放';
    } else if (item.id === 'AST-DOC-01' || item.id === 'AST-DOC-02') {
      clickAction = `viewOfficialDocModal('${item.id}')`;
      actionBtnText = '📄 查看红头公函全文';
    }

    return `
      <div class="asset-thumb-card">
        <div class="asset-thumb-preview" onclick="${clickAction}" style="cursor:pointer;">
          <img src="${item.thumb}" alt="">
          <span class="asset-thumb-badge">${item.category === 'video' ? '🎬 视频 · ' + item.duration : (item.category === 'doc' ? '📄 官方公函' : item.catName)}</span>
          ${item.category === 'video' ? `<div style="position:absolute; width:34px; height:34px; border-radius:50%; background:rgba(20,91,255,0.85); display:flex; align-items:center; justify-content:center; color:#fff; font-size:13px;">▶</div>` : ''}
        </div>
        <div class="asset-card-info">
          <div class="asset-card-title">${item.name}</div>
          <div style="font-size:11.5px; color:var(--text-muted); margin-bottom:4px; line-height:1.4;">${item.desc.slice(0, 42)}...</div>
          <div class="asset-card-meta">
            <span>${item.format} · ${item.size}</span>
            <span style="color:var(--primary); font-weight:700; cursor:pointer;" onclick="${clickAction}">${actionBtnText}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function filterAssetCategory(cat) {
  currentAssetCategory = cat;
  const tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach(t => {
    if (t.getAttribute('data-type') === cat) t.classList.add('active');
    else t.classList.remove('active');
  });
  renderAssetVaultGrid();
}

function renderHistoryTable() {
  const tbody = document.getElementById('historyTableBody');
  if (!tbody) return;

  tbody.innerHTML = drillHistoryList.map(h => `
    <tr>
      <td><strong>${h.id}</strong></td>
      <td><strong>${h.title}</strong></td>
      <td style="font-size:12px; color:var(--primary);">${h.script}</td>
      <td><span style="font-weight:600;">${h.diff}</span></td>
      <td><span style="font-weight:700; color:var(--success); font-size:13px;">${h.score}</span></td>
      <td style="font-size:12px; color:var(--text-muted);">${h.time}</td>
      <td>
        <button class="btn-link" onclick="showToast('回放历史演练走向轨迹', 'info')">走向复盘</button>
      </td>
    </tr>
  `).join('');
}

// 视频播放模态框
function playVideoModal(assetId) {
  const item = assetLibrary.find(a => a.id === assetId);
  const titleEl = document.getElementById('videoModalTitle');
  const videoEl = document.getElementById('html5VideoPlayer');

  if (titleEl && item) titleEl.textContent = `在线视频播放 · ${item.name}`;
  if (videoEl) {
    videoEl.currentTime = 0;
    videoEl.play().catch(() => {});
  }
  openModal('modal_play_video');
}

function closeVideoModal() {
  const videoEl = document.getElementById('html5VideoPlayer');
  if (videoEl) videoEl.pause();
  closeModal('modal_play_video');
}

// 派生向导
let deriveStep = 1;
function openDeriveWizardModal() {
  deriveStep = 1;
  renderDeriveWizardStep();
  openModal('modal_derive_wizard');
}

function renderDeriveWizardStep() {
  const s1 = document.getElementById('dwStep1');
  const s2 = document.getElementById('dwStep2');
  const s3 = document.getElementById('dwStep3');
  const content = document.getElementById('deriveWizardContent');
  const footer = document.getElementById('deriveWizardFooter');

  [s1, s2, s3].forEach((el, idx) => {
    if (el) el.className = (idx + 1 === deriveStep) ? 'dw-step active' : 'dw-step';
  });

  if (deriveStep === 1) {
    content.innerHTML = `
      <div class="form-group"><label>参考源文件：</label><div style="font-weight:bold; color:var(--text-title);">演练材料一：火灾事故V6.doc</div></div>
      <div class="form-row-2">
        <div class="form-group">
          <label>派生新剧本名称 <span class="required">*</span></label>
          <input type="text" class="form-input" id="derScriptName" value="K市P区某居民楼突发火灾爆燃处置演练 (红蓝对抗版)">
        </div>
        <div class="form-group">
          <label>演练难度预设</label>
          <select class="form-input" id="derScriptDiff">
            <option value="easy">简单 (指导式)</option>
            <option value="medium" selected>中等 (实战推演)</option>
            <option value="hard">困难 (高压施压)</option>
          </select>
        </div>
      </div>
      <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:10px; border-radius:4px; font-size:12px; margin-top:8px;">
        ✔ 自动从文档中提取事件背景：K市P区省会核心区、花园居小区2008年高层住宅15栋5000人。<br>
        ✔ 初始政府公信力天平基准设定为 100 分。
      </div>
    `;
    footer.innerHTML = `
      <button class="btn-default" onclick="closeModal('modal_derive_wizard')">取消</button>
      <button class="btn-primary" onclick="deriveStep=2; renderDeriveWizardStep();">下一步：生成5大阶段与正负分支 ➔</button>
    `;
  } else if (deriveStep === 2) {
    content.innerHTML = `
      <div style="font-size:12.5px; font-weight:700; margin-bottom:8px;">系统已从火灾事故V6文档智能提取 5 个推进阶段及正负处置分支：</div>
      <div style="font-size:12px; line-height:1.7; background:#fff; border:1px solid #e2e8f0; padding:10px; border-radius:4px; max-height:220px; overflow-y:auto;">
        <div>● <strong>阶段 1 (19:15) 初发爆燃</strong> ➔ 走向A (+5分) / 走向B (-15分)</div>
        <div>● <strong>阶段 2 (21:00) 消防通道受阻与通报</strong> ➔ 走向A 破拆清障(+10分) / 走向B 夺抢记者设备(-25分)</div>
        <div>● <strong>阶段 3 (次日07:00) 维权堵路与次生炒作</strong> ➔ 走向A 专班核查(+15分) / 走向B 驱散激化(-30分)</div>
        <div>● <strong>阶段 4 (次日12:00) 恶性造谣死50人</strong> ➔ 走向A 拘留辟谣(+20分) / 走向B 空洞回避(-20分)</div>
        <div>● <strong>阶段 5 (次日17:00) 发布会总结定调</strong> ➔ 走向A 默哀致歉担当(+25分) / 走向B 官僚套话(-25分)</div>
      </div>
    `;
    footer.innerHTML = `
      <button class="btn-default" onclick="deriveStep=1; renderDeriveWizardStep();">上一步</button>
      <button class="btn-primary" onclick="deriveStep=3; renderDeriveWizardStep();">下一步：绑定火灾视频素材 ➔</button>
    `;
  } else if (deriveStep === 3) {
    content.innerHTML = `
      <div style="font-size:12.5px; font-weight:700; margin-bottom:8px;">自动匹配关联多模态素材资源：</div>
      <div style="display:flex; flex-direction:column; gap:8px;">
        <div style="display:flex; align-items:center; gap:8px; padding:10px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:4px; font-size:12px;">
          <span>🎬</span>
          <div>
            <strong>自动挂接：《P区花园居小区高层爆燃现场实况视频》 (火灾素材视频.mp4)</strong>
            <div style="color:var(--text-muted); font-size:11px;">已自动挂接到红方阶段一初始曝光节点。</div>
          </div>
        </div>
      </div>
    `;
    footer.innerHTML = `
      <button class="btn-default" onclick="deriveStep=2; renderDeriveWizardStep();">上一步</button>
      <button class="btn-primary" onclick="finishDeriveWizard()">🚀 生成剧本卡带并进入工作台</button>
    `;
  }
}

function finishDeriveWizard() {
  closeModal('modal_derive_wizard');
  showToast('🎉 从《火灾事故V6》派生成功！已生成具备5大阶段与红蓝走向的完整剧本卡带。', 'success');
  openWorkbenchForScript('JB-FIRE-20250408');
}

function openImportCaseModal() {
  showToast('点击选择本地文档《演练材料一：火灾事故V6.doc》完成导入解析！', 'info');
}

function openUploadVideoModal() {
  openModal('modal_play_video');
}

// 模态框通用控制
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.style.display = 'flex';
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.style.display = 'none';
}

// showToast 由 @components/common/toast 提供统一赛博规范

// 广播卡带切换到其他终端 (大屏端、PC战境端、手机端)
function broadcastActiveCartridgeToSyncEngine(cartridge) {
  try {
    if (window.battleDrillStore && typeof window.battleDrillStore.broadcast === 'function') {
      window.battleDrillStore.broadcast('SCRIPT_CARTRIDGE_CHANGED', {
        cartridgeId: cartridge.id,
        cartridgeName: cartridge.name,
        difficulty: cartridge.difficulty,
        duration: cartridge.duration,
        credibilityBaseline: cartridge.credibilityBaseline,
        stages: cartridge.stages
      });
    }
  } catch (e) {
    console.log('Sync broadcast note:', e);
  }
}
