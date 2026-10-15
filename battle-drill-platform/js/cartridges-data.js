/**
 * 舆情百战演练平台 · 预设剧本与卡带数据库
 * 剧本类型体系：
 * 1. 城市安全与突发防灾 (city_safety)
 * 2. 文化旅游与社会治安 (tourism_security)
 * 3. 生态环保与城市治理 (ecology_environment)
 * 4. 食品药品与公共卫生 (food_health)
 * 5. 教育校园与未成年保护 (education_campus)
 * 6. 政务民生与社会服务 (civic_livelihood)
 */

window.DEFAULT_DRILL_CARTRIDGES = [
  {
    "id": "JB-FIRE-20250408",
    "category": "standard",
    "categoryName": "常规推演类 (标准攻防)",
    "mode": "standard",
    "name": "K市P区某居民楼突发火灾爆燃与网络造谣处置演练",
    "type": "city_safety",
    "typeName": "城市安全与突发防灾",
    "difficulty": "medium",
    "duration": 90,
    "startDate": "2026-04-08",
    "endDate": "2026-04-09",
    "virtualDuration": 90,
    "timeSpeed": 24,
    "credibilityBaseline": 100,
    "status": "active",
    "updatedAt": "2026-10-10 11:55",
    "creator": "汪艳琼 (特聘教官)",
    "coverUrl": "./media/fire_cover.jpg",
    "bgUrl": "./media/fire_bg.jpg",
    "bgDesc": "K市P区作为省会城市核心城区，辖区面积98平方公里，常住人口超120万。4月8日18时57分，X街道花园居小区高层住宅突发火灾。该小区建成于2008年，共有居民楼15栋，入住率高达90%，常住人口超过5000人，老弱病残孕多，紧邻地铁站与大型商超。现场23层住宅东侧房间起火爆炸，浓烟滚滚，十余名校服学生惊慌逃离。",
    "preDrillMedia": {
      "storyIntroVideo": "./media/fire_material_video.mp4",
      "storyIntroTitle": "突发火灾现场全景还原与首发爆料",
      "rulesGuideVideo": "./media/fire_material_video.mp4",
      "rulesGuideTitle": "红蓝对抗协同演练机制与防误导注意事项"
    },
    "alarmConfig": {
      "enabled": true,
      "lowScoreThreshold": 60,
      "singlePenaltyThreshold": -10,
      "soundType": "alarm_critical",
      "alertPulse": true
    },
    "rolePool": {
      "blueRoles": [
        { "id": "blue_commander", "name": "市委网信办监测专班", "role": "网信指挥长", "seatType": "single", "capacity": 1, "avatar": "👑", "desc": "全面把控舆情研判与指令下发" },
        { "id": "blue_emergency", "name": "区应急管理局指挥调度席", "role": "应急调度席", "seatType": "table", "capacity": 6, "avatar": "🛡️", "desc": "前线救援调度、疏散与综合协调" },
        { "id": "blue_fire", "name": "区消防救援大队", "role": "消防指挥席", "seatType": "table", "capacity": 6, "avatar": "🚒", "desc": "火势内攻扑救、搜救受困人员、火因调查" },
        { "id": "blue_police", "name": "区公安分局 (网安/治安)", "role": "公安执法席", "seatType": "single", "capacity": 2, "avatar": "👮", "desc": "现场警戒交通管制、网络造谣查处打击" },
        { "id": "blue_street", "name": "X街道办事处安监组", "role": "属地善后席", "seatType": "table", "capacity": 6, "avatar": "🤝", "desc": "受灾群众安置、业主安抚、维稳走访" },
        { "id": "blue_spokesman", "name": "联合调查组新闻发言人", "role": "官方发声席", "seatType": "single", "capacity": 1, "avatar": "📢", "desc": "通报起草、权威辟谣与新闻发布会" }
      ],
      "redRoles": [
        { "id": "red_cloud", "name": "抖音网民“云朵儿”", "role": "现场首发拍客", "avatar": "📱", "canUploadVideo": true, "desc": "火灾现场第一视角拍摄短视频发布爆料" },
        { "id": "red_xiaofei", "name": "造谣网民“小飞飞”", "role": "恶意带节奏自媒体", "avatar": "🚨", "canUploadVideo": false, "desc": "炮制伤亡数字谣言博眼球" },
        { "id": "red_crowd", "name": "全网网民与吃瓜群众", "role": "大众互动群演", "avatar": "💬", "canUploadVideo": false, "desc": "评论、点赞、转发煽风点火与情绪发酵" }
      ]
    },
    "stages": [
      {
        "id": "STAGE-01",
        "name": "阶段一：初发舆情发现与核实",
        "startTime": "2026-04-08 18:57",
        "endTime": "2026-04-08 19:30",
        "isCrossDay": false,
        "timeTag": "04-08 18:57 ~ 19:30",
        "summary": "抖音网民“云朵儿”发布爆燃视频引发热炒，网信巡查发现并点点迷信内部调度应急消防核实。",
        "selectedBranch": "branch_a",
        "confrontations": [
          {
            "id": "CF-101",
            "time": "18:57",
            "stageId": "STAGE-01",
            "stageName": "阶段一：初发舆情发现与核实",
            "red": {
              "id": "RP-101",
              "role": "抖音网民“云朵儿”",
              "author": "云朵儿",
              "avatar": "📱",
              "platform": "抖音短视频",
              "content": "“P区X街道花园居小区高层突发爆燃事故！” 视频可见浓烟滚滚、房屋烧毁严重，逃生居民中见十余名穿着校服哭泣的学生。(获8000点赞、560条评论)",
              "assetId": "AST-001",
              "assetName": "火灾现场实况视频.mp4",
              "videoUrl": "./media/fire_material_video.mp4",
              "penalty": -15,
              "trendingPlatform": "douyin",
              "trendingRank": "Top 1 (爆)"
            },
            "blues": []
          },
          {
            "id": "CF-102",
            "time": "19:15",
            "stageId": "STAGE-01",
            "stageName": "阶段一：初发舆情发现与核实",
            "red": null,
            "blues": [
              {
                "id": "BM-1A1",
                "role": "市委网信办监测专班",
                "author": "网信指挥席",
                "avatar": "👑",
                "category": "diandian_dispatch",
                "platform": "点点密信内部指令",
                "title": "【点点密信指令】调度应急消防30分钟内核实现场伤亡",
                "statement": "【点点密信内部督导】@区应急管理局 @区消防救援大队：网络监测到花园居突发爆燃舆情，请30分钟内紧急报送初核火情、现场伤亡及首批搜救力量！",
                "branchName": "走向 1-A (协同高效核实)",
                "docAssetId": "",
                "delta": 10,
                "trendingPlatform": "",
                "trendingRank": ""
              }
            ]
          },
          {
            "id": "CF-103",
            "time": "19:25",
            "stageId": "STAGE-01",
            "stageName": "阶段一：初发舆情发现与核实",
            "red": null,
            "blues": [
              {
                "id": "BM-1A2",
                "role": "区应急管理局指挥调度席",
                "author": "应急指挥席",
                "avatar": "🛡️",
                "category": "field_operation",
                "platform": "官方现场应急处置",
                "title": "【前线应急处置】疏散现场人员与设立警戒区，120名消防官兵展开内攻",
                "statement": "【前线处置情况】区应急管理局现场疏散转移受灾群众286人，设立外围安全警戒线，区消防8台高喷车展开内攻灭火，暂无人员死亡汇报。",
                "branchName": "走向 1-A (首战协同闭环)",
                "docAssetId": "",
                "delta": 10,
                "trendingPlatform": "weibo",
                "trendingRank": "同城榜首"
              }
            ]
          },
          {
            "id": "CF-104",
            "time": "19:30",
            "stageId": "STAGE-01",
            "stageName": "阶段一：初发舆情发现与核实",
            "red": {
              "id": "RP-102",
              "role": "现场聚集围观群众",
              "author": "现场围观群众",
              "avatar": "👥",
              "platform": "快手平台 / 微信群",
              "content": "“现场火势窜起十几米高，警报声响成一片，有人在窗边挥白毛巾求救！” (多群转发数百次，现场恐慌情绪蔓延)",
              "assetId": "",
              "assetName": "",
              "penalty": -10,
              "trendingPlatform": "kuaishou",
              "trendingRank": "Top 3 (沸)"
            },
            "blues": []
          }
        ],
        "redCamp": {
          "roles": [
            {
              "id": "R1-1",
              "name": "抖音爆料网民“云朵儿”",
              "active": true
            },
            {
              "id": "R1-2",
              "name": "现场聚集围观群众",
              "active": true
            },
            {
              "id": "R1-3",
              "name": "逃生获救居民群体",
              "active": false
            }
          ],
          "posts": [
            {
              "id": "RP-101",
              "role": "抖音网民“云朵儿”",
              "author": "抖音网民“云朵儿”",
              "platform": "抖音短视频",
              "type": "现场爆料",
              "penalty": -15,
              "content": "“P区X街道花园居小区高层突发爆燃事故！” 视频可见浓烟滚滚、房屋烧毁严重，逃生居民中见十余名穿着校服哭泣的学生。(获8000点赞、560条评论)",
              "assetId": "AST-001",
              "assetName": "火灾现场实况视频 (MP4)",
              "trendingPlatform": "douyin",
              "trendingRank": "Top 1 (爆)"
            },
            {
              "id": "RP-102",
              "role": "现场聚集围观群众",
              "author": "现场围观群众",
              "platform": "快手平台 / 微信群",
              "type": "恐慌发酵",
              "penalty": -10,
              "content": "“现场火势窜起十几米高，警报声响成一片，有人在窗边挥白毛巾求救！” (多群转发数百次，现场恐慌情绪蔓延)",
              "assetId": "",
              "trendingPlatform": "kuaishou",
              "trendingRank": "Top 3 (沸)"
            }
          ],
          "assets": [
            "AST-001"
          ]
        },
        "blueCamp": {
          "roles": [
            {
              "id": "B1-1",
              "name": "市委网信办监测专班",
              "active": true
            },
            {
              "id": "B1-2",
              "name": "区应急管理局指挥调度席",
              "active": true
            },
            {
              "id": "B1-3",
              "name": "区消防救援大队",
              "active": true
            },
            {
              "id": "B1-4",
              "name": "X街道办事处安监组",
              "active": true
            }
          ],
          "measures": [
            {
              "id": "BM-1A1",
              "role": "市委网信办监测专班",
              "category": "diandian_dispatch",
              "targetUnit": "区应急管理局、区消防救援大队",
              "branchKey": "positive_a",
              "title": "【点点密信指令】调度区应急局与消防大队30分钟内核实现场与伤亡",
              "type": "positive",
              "delta": 10,
              "branchName": "走向 1-A (协同高效核实)",
              "desc": "通过点点密信协同指令平台，要求应急与消防30分钟内精准报送现场火势、伤亡人数及出动力量。",
              "statement": "【点点密信内部督导】@区应急管理局 @区消防救援大队：网络监测到花园居突发爆燃舆情，请30分钟内紧急报送初核火情、现场伤亡及首批搜救力量！",
              "trendingPlatform": "",
              "trendingRank": ""
            },
            {
              "id": "BM-1A2",
              "role": "区应急管理局指挥调度席",
              "category": "field_operation",
              "targetUnit": "市委网信办",
              "branchKey": "positive_a",
              "title": "【前线应急处置】疏散现场人员与设立警戒区，120名消防官兵展开内攻",
              "type": "positive",
              "delta": 10,
              "branchName": "走向 1-A (首战协同闭环)",
              "desc": "区应急指挥席迅速疏散现场受灾人员与设立外围警戒线，并跟报120名官兵内攻无伤亡情况。",
              "statement": "【前线处置情况】区应急管理局现场疏散转移受灾群众286人，设立外围安全警戒线，区消防8台高喷车展开内攻灭火，暂无人员死亡汇报。",
              "trendingPlatform": "weibo",
              "trendingRank": "同城榜首"
            },
            {
              "id": "BM-1B",
              "role": "区应急管理局指挥调度席",
              "category": "field_operation",
              "branchKey": "negative_b",
              "title": "措施 1-B：以非本管辖推诿扯皮，超1小时未回应",
              "type": "negative",
              "delta": -15,
              "branchName": "走向 1-B (失当迟滞失控)",
              "desc": "部门间沟通迟缓，以“非本管辖”推诿扯皮，现场未划定警戒线，任由围观群众靠近拍摄并二次堵塞道路。",
              "statement": "【失当推诿走向】部门间沟通迟缓，以“非本管辖权属”推诿扯皮，迟迟未划定警戒线疏散人群，任由群众围观拍摄，处置响应拖延超1小时。",
              "trendingPlatform": "",
              "trendingRank": ""
            }
          ],
          "statements": [
            "公文：关于启动城市火灾应急响应指挥预案的批示"
          ]
        }
      },
      {
        "id": "STAGE-02",
        "name": "阶段二：现场受阻与初次通报",
        "startTime": "2026-04-08 19:30",
        "endTime": "2026-04-08 21:30",
        "isCrossDay": false,
        "timeTag": "04-08 19:30 ~ 21:30",
        "summary": "消防通道违停受阻、记者越界突发采访争端，21时明火扑灭并选用模版对外发布第一期火灾搜救通报。",
        "selectedBranch": "branch_a",
        "confrontations": [
          {
            "id": "CF-201",
            "time": "19:45",
            "stageId": "STAGE-02",
            "stageName": "阶段二：现场受阻与初次通报",
            "red": {
              "id": "RP-201",
              "role": "涉事小区业主代表",
              "author": "业主代表",
              "avatar": "🏢",
              "platform": "新浪微博 / 微信群",
              "content": "小区消防通道被多辆私家车严重堵塞，消防车被堵在门外进不去！现场一度混乱，#消防通道变死亡通道#引发众怒！",
              "assetId": "AST-002",
              "assetName": "消防通道堵死现场监控照片 (JPG)",
              "imgUrl": "./media/cover.png",
              "penalty": -15,
              "trendingPlatform": "weibo",
              "trendingRank": "Top 3 (#消防通道变死亡通道#)"
            },
            "blues": []
          },
          {
            "id": "CF-202",
            "time": "20:10",
            "stageId": "STAGE-02",
            "stageName": "阶段二：现场受阻与初次通报",
            "red": null,
            "blues": [
              {
                "id": "BM-2A1",
                "role": "消防现场指挥部 & 交警排障组",
                "author": "消防交警联勤",
                "avatar": "🚒",
                "category": "field_operation",
                "platform": "消防交警联勤处置",
                "title": "破拆违停私家车开辟救援通道 + 纪检监察倒查涉事物业安全责任",
                "statement": "【排障指令】交警与消防联勤联动，依法对违停阻碍救援车辆强行破拆移位，确保供水登高通道畅通。",
                "branchName": "走向 2-A (攻克救援堵点)",
                "docAssetId": "",
                "delta": 10,
                "trendingPlatform": "",
                "trendingRank": ""
              }
            ]
          },
          {
            "id": "CF-203",
            "time": "20:30",
            "stageId": "STAGE-02",
            "stageName": "阶段二：现场受阻与初次通报",
            "red": {
              "id": "RP-202",
              "role": "《红星新闻》驻市记者团队",
              "author": "红星新闻直播团队",
              "avatar": "📹",
              "platform": "快手直播 / 微信公众号",
              "content": "记者越过警戒线进行现场直播，以“警戒线标注不明”拒绝离开，疑似与现场个别安保发生争夺摄像设备，全网声讨采访遇阻！",
              "assetId": "AST-004",
              "assetName": "《采访遇阻》文章扫描件 (PDF)",
              "penalty": -15,
              "trendingPlatform": "toutiao",
              "trendingRank": "Top 2 (热)"
            },
            "blues": []
          },
          {
            "id": "CF-204",
            "time": "20:45",
            "stageId": "STAGE-02",
            "stageName": "阶段二：现场受阻与初次通报",
            "red": null,
            "blues": [
              {
                "id": "BM-2A2",
                "role": "宣传部媒体协调组",
                "author": "媒体协调专员",
                "avatar": "📢",
                "category": "media_interview",
                "platform": "宣传部媒体协调",
                "title": "【突发采访应对】引导记者至安全采访区，现场回应搜救进度保障知情权",
                "statement": "【突发采访回应】“感谢媒体监督，现场正在进行高空内攻救援，请记者朋友随同转入安全发布区，我们每半小时通报搜救进展。”",
                "branchName": "走向 2-A1 (善待媒体善用媒体)",
                "docAssetId": "",
                "delta": 10,
                "trendingPlatform": "",
                "trendingRank": ""
              }
            ]
          },
          {
            "id": "CF-205",
            "time": "21:00",
            "stageId": "STAGE-02",
            "stageName": "阶段二：现场受阻与初次通报",
            "red": null,
            "blues": [
              {
                "id": "BM-2A3",
                "role": "联合调查组新闻发言人",
                "author": "官方新闻发言人",
                "avatar": "🏛️",
                "category": "official_notice",
                "platform": "新浪微博权威通报",
                "templateId": "AST-DOC-01",
                "docAssetId": "AST-DOC-01",
                "title": "【官方通报发布】选用模版《火灾搜救与基本情况通报》(附件一) 权威发布",
                "statement": "【第一期搜救通报】截至21时明火完全扑灭，共疏散286人，搜救出伤员21人，4人不幸遇难。联合调查组已成立。",
                "branchName": "走向 2-A2 (抢占事实首发权)",
                "delta": 15,
                "trendingPlatform": "weibo",
                "trendingRank": "Top 1 (权威置顶)"
              }
            ]
          }
        ],
        "redCamp": {
          "roles": [
            {
              "id": "R2-1",
              "name": "《红星新闻》驻市记者团队",
              "active": true
            },
            {
              "id": "R2-2",
              "name": "涉事小区业主代表",
              "active": true
            },
            {
              "id": "R2-3",
              "name": "涉事花园居物业人员",
              "active": false
            }
          ],
          "posts": [
            {
              "id": "RP-201",
              "role": "涉事小区业主代表",
              "author": "现场网民发帖",
              "platform": "微博 / 抖音",
              "type": "舆情发酵",
              "penalty": -15,
              "content": "小区消防通道被多辆私家车严重堵塞，消防车被堵在门外进不去！现场一度混乱，#消防通道变死亡通道#引发众怒！",
              "assetId": "AST-002",
              "trendingPlatform": "weibo",
              "trendingRank": "Top 3"
            },
            {
              "id": "RP-202",
              "role": "《红星新闻》驻市记者团队",
              "author": "红星新闻直播团队",
              "platform": "快手直播 / 微信公众号",
              "type": "媒体冲突",
              "penalty": -15,
              "content": "记者越过警戒线进行现场直播，以“警戒线标注不明”拒绝离开，疑似与现场安保发生争夺摄像设备。",
              "assetId": "AST-004",
              "trendingPlatform": "toutiao",
              "trendingRank": "Top 2"
            }
          ],
          "assets": [
            "AST-002",
            "AST-004"
          ]
        },
        "blueCamp": {
          "roles": [
            {
              "id": "B2-1",
              "name": "消防现场指挥官",
              "active": true
            },
            {
              "id": "B2-2",
              "name": "交警排障疏导席",
              "active": true
            },
            {
              "id": "B2-3",
              "name": "现场安保秩序维稳组",
              "active": true
            },
            {
              "id": "B2-4",
              "name": "宣传部媒体沟通组",
              "active": true
            }
          ],
          "measures": [
            {
              "id": "BM-2A2",
              "role": "宣传部媒体沟通组",
              "category": "media_interview",
              "branchKey": "positive_a",
              "title": "【突发采访应对】引导记者至安全专区，现场回应搜救进度保障知情权",
              "type": "positive",
              "delta": 10,
              "branchName": "走向 2-A1 (善待媒体善用媒体)",
              "desc": "现场安保与宣传专员设立媒体采访引导专线，每30分钟发布最新救援进度，平息记者对立情绪。",
              "statement": "【突发采访回应】“感谢媒体监督，现场正在进行高空内攻救援，请记者朋友随同转入安全发布区，我们每半小时通报搜救进展。”",
              "trendingPlatform": "",
              "trendingRank": ""
            },
            {
              "id": "BM-2A3",
              "role": "联合调查组新闻发言人",
              "category": "official_notice",
              "templateId": "AST-DOC-01",
              "docAssetId": "AST-DOC-01",
              "branchKey": "positive_a",
              "title": "【官方通报发布】选用模版《火灾搜救与基本情况通报》(附件一) 权威发布",
              "type": "positive",
              "delta": 15,
              "branchName": "走向 2-A2 (抢占事实首发权)",
              "desc": "搜救结束30分钟内发布第一期通报，公布扑救历程、伤亡21人遇难4人真实数字，抢占事实首发权。",
              "statement": "【情况通报】截至4月8日21时，花园居小区火灾明火完全扑灭，共疏散居民286人，搜救出伤员21人，4人不幸遇难。联合调查组已成立。",
              "trendingPlatform": "weibo",
              "trendingRank": "Top 1 (权威置顶)"
            },
            {
              "id": "BM-2B",
              "role": "现场处置组",
              "category": "field_operation",
              "branchKey": "negative_b",
              "title": "措施 2-B：安保粗暴夺抢记者摄像机 + 封锁消息瞒报为“无重大伤亡”",
              "type": "negative",
              "delta": -25,
              "branchName": "走向 2-B (媒体声讨舆情引爆)",
              "desc": "粗暴推搡记者并夺抢设备，引发全国新闻界声讨《采访遇阻》；通报拖延至次日且死伤数字含糊其辞。",
              "statement": "",
              "trendingPlatform": "",
              "trendingRank": ""
            }
          ],
          "statements": [
            "第一期《关于P区花园居小区火灾搜救与基本情况通报》"
          ]
        }
      },
      {
        "id": "STAGE-03",
        "name": "阶段三：家属情绪与次生舆情",
        "startTime": "2026-04-08 21:30",
        "endTime": "2026-04-09 07:00",
        "isCrossDay": true,
        "timeTag": "🌙 跨天 04-08 21:30 ~ 04-09 07:00",
        "summary": "遇难家属围堵要说法，衍生移花接木便衣抓家属、补课黑产业链、物业空消火栓箱热搜，跨夜联合专班分类拆解。",
        "selectedBranch": "branch_a",
        "confrontations": [
          {
            "id": "CF-301",
            "date": "04-08",
            "time": "21:30",
            "stageId": "STAGE-03",
            "stageName": "阶段三：家属情绪与次生舆情",
            "red": {
              "id": "RP-301",
              "role": "快手自媒体“@直击K市现场”",
              "author": "直击K市现场",
              "avatar": "📱",
              "platform": "快手短视频",
              "content": "移花接木其它事件视频声称：“维权家属被便衣警察押上黑车，政府镇压！” 恶意渲染警民冲突。(引发跨群热议)",
              "assetId": "",
              "assetName": "",
              "penalty": -20,
              "trendingPlatform": "kuaishou",
              "trendingRank": "Top 2 (热)"
            },
            "blues": []
          },
          {
            "id": "CF-302",
            "date": "04-08",
            "time": "22:15",
            "stageId": "STAGE-03",
            "stageName": "阶段三：家属情绪与次生舆情",
            "red": null,
            "blues": [
              {
                "id": "BM-3A1",
                "role": "联合善后专班 (街道+卫健)",
                "author": "善后关怀专班",
                "avatar": "❤️",
                "category": "diandian_dispatch",
                "platform": "点点密信督导协同",
                "title": "【点点密信内部督导】一户一专班连夜入驻医院，真诚倾听家属诉求",
                "statement": "【点点密信督导】街道与卫健联合抽调24人组建4个关怀组，一对一帮扶遇难和重伤者家庭，开辟医疗心理双通道。",
                "branchName": "走向 3-A1 (温情救济化解矛盾)",
                "docAssetId": "",
                "delta": 15,
                "trendingPlatform": "",
                "trendingRank": ""
              }
            ]
          },
          {
            "id": "CF-303",
            "date": "04-08",
            "time": "23:00",
            "stageId": "STAGE-03",
            "stageName": "阶段三：家属情绪与次生舆情",
            "red": {
              "id": "RP-302",
              "role": "微博组织“@正义家长联盟”",
              "author": "正义家长联盟",
              "avatar": "🎓",
              "platform": "微博同城话题",
              "content": "“育才中学学生火灾中逃生！教育局明面取消晚自习暗地纵容居民楼补课！拿孩子命换升学率？#补课黑产业链#” (转发4.1万)",
              "assetId": "",
              "assetName": "",
              "penalty": -15,
              "trendingPlatform": "weibo",
              "trendingRank": "Top 4 (#补课黑产业链#)"
            },
            "blues": []
          },
          {
            "id": "CF-304",
            "date": "04-09",
            "time": "01:30",
            "stageId": "STAGE-03",
            "stageName": "阶段三：家属情绪与次生舆情",
            "red": null,
            "blues": [
              {
                "id": "BM-3A2",
                "role": "区教育局核查专班",
                "author": "教育局联合调查组",
                "avatar": "🏫",
                "category": "official_notice",
                "platform": "官方微博通报",
                "title": "【教育核查通报】连夜联合摸排租住房源，澄清起火住户为普通陪读家庭",
                "statement": "【教育核查通报】经深入核查，起火单元为两户普通租住家庭，未开设辅导机构，逃生学生为同小区结伴复习，谣言不实。",
                "branchName": "走向 3-A2 (快速核查阻断黑产炒作)",
                "docAssetId": "",
                "delta": 10,
                "trendingPlatform": "weibo",
                "trendingRank": "热搜澄清"
              }
            ]
          },
          {
            "id": "CF-305",
            "date": "04-09",
            "time": "03:20",
            "stageId": "STAGE-03",
            "stageName": "阶段三：家属情绪与次生舆情",
            "red": {
              "id": "RP-303",
              "role": "业主群维权爆料网民",
              "author": "业主爆料网民",
              "avatar": "🏢",
              "platform": "小红书 / 微信群",
              "content": "“去年消防检查合格是物业伪造签字！消火栓箱里根本没有水枪水带！XX物业谋杀业主！” (附空消火栓箱照片)",
              "assetId": "AST-003",
              "assetName": "空消火栓箱与伪造签字图 (PNG)",
              "imgUrl": "./media/cover.png",
              "penalty": -15,
              "trendingPlatform": "douyin",
              "trendingRank": "Top 5"
            },
            "blues": []
          },
          {
            "id": "CF-306",
            "date": "04-09",
            "time": "05:40",
            "stageId": "STAGE-03",
            "stageName": "阶段三：家属情绪与次生舆情",
            "red": null,
            "blues": [
              {
                "id": "BM-3A3",
                "role": "区住建局与消防执法科",
                "author": "住建与执法科",
                "avatar": "⚖️",
                "category": "field_operation",
                "platform": "今日头条权威通报",
                "title": "【立案通报】查封涉事物业历年消防台账 + 纪检监察倒查维保虚假签字",
                "statement": "【立案通报】住建与消防执法部门已查封物业公司消防安全维保档案，涉嫌虚假签字问题已移交纪检监察部门立案查处。",
                "branchName": "走向 3-A3 (铁腕执法平息众怒)",
                "docAssetId": "",
                "delta": 15,
                "trendingPlatform": "toutiao",
                "trendingRank": "Top 3 (权威发布)"
              }
            ]
          }
        ],
        "redCamp": {
          "roles": [
            {
              "id": "R3-1",
              "name": "遇难及重伤者家属代表",
              "active": true
            },
            {
              "id": "R3-2",
              "name": "快手自媒体“@直击K市现场”",
              "active": true
            },
            {
              "id": "R3-3",
              "name": "微博组织“@正义家长联盟”",
              "active": true
            },
            {
              "id": "R3-4",
              "name": "百万大V“@顽皮的郭贝勒”",
              "active": true
            }
          ],
          "posts": [
            {
              "id": "RP-301",
              "role": "快手自媒体“@直击K市现场”",
              "author": "快手“@直击K市现场”",
              "platform": "快手平台",
              "type": "移花接木造谣",
              "penalty": -20,
              "content": "移花接木其它事件视频声称：“维权家属被便衣警察押上黑车，政府镇压！” 恶意渲染警民冲突。",
              "trendingPlatform": "kuaishou",
              "trendingRank": "Top 2"
            },
            {
              "id": "RP-302",
              "role": "微博组织“@正义家长联盟”",
              "author": "“@正义家长联盟”",
              "platform": "微博同城话题",
              "type": "衍生黑产炒作",
              "penalty": -15,
              "content": "“育才中学学生火灾中逃生！教育局明面取消晚自习暗地纵容居民楼补课！拿孩子命换升学率？#补课黑产业链#” (转发4.1万)",
              "trendingPlatform": "weibo",
              "trendingRank": "Top 4"
            },
            {
              "id": "RP-303",
              "role": "遇难及重伤者家属代表",
              "author": "业主群疯传网民",
              "platform": "小红书 / 微信",
              "type": "声讨物业",
              "penalty": -15,
              "content": "“去年消防检查合格是物业伪造签字！消火栓箱里根本没有水枪水带！XX物业谋杀业主！”",
              "assetId": "AST-003",
              "trendingPlatform": "douyin",
              "trendingRank": "Top 5"
            }
          ],
          "assets": [
            "AST-003"
          ]
        },
        "blueCamp": {
          "roles": [
            {
              "id": "B3-1",
              "name": "联合善后专班 (街道+卫健)",
              "active": true
            },
            {
              "id": "B3-2",
              "name": "区公安分局治安与网安大队",
              "active": true
            },
            {
              "id": "B3-3",
              "name": "区教育局核查专班",
              "active": true
            },
            {
              "id": "B3-4",
              "name": "住建与消防执法科",
              "active": true
            }
          ],
          "measures": [
            {
              "id": "BM-3A1",
              "role": "联合善后专班 (街道+卫健)",
              "category": "diandian_dispatch",
              "branchKey": "positive_a",
              "title": "【点点迷信内部督导】一户一专班连夜入驻医院，真诚倾听家属诉求",
              "type": "positive",
              "delta": 15,
              "branchName": "走向 3-A1 (温情救济化解矛盾)",
              "desc": "由区领导带队，街道、民政、心理专家组成专属关怀组，一对一帮扶遇难和重伤者家庭。",
              "statement": "【点点迷信督导】街道与卫健联合抽调24人组建4个关怀组，一对一帮扶遇难和重伤者家庭，开辟医疗心理双通道。",
              "trendingPlatform": "",
              "trendingRank": ""
            },
            {
              "id": "BM-3A2",
              "role": "区教育局核查专班",
              "category": "official_notice",
              "branchKey": "positive_a",
              "title": "【教育核查通报】连夜联合摸排租住房源，澄清起火住户为普通陪读家庭",
              "type": "positive",
              "delta": 10,
              "branchName": "走向 3-A2 (快速核查阻断黑产炒作)",
              "desc": "针对网传“居民楼非法补课”，连夜走访学校与住户，证实起火住户系两户普通租客，非培训机构。",
              "statement": "【教育核查通报】经深入核查，起火单元为两户普通租住家庭，未开设辅导机构，逃生学生为同小区结伴复习，谣言不实。",
              "trendingPlatform": "weibo",
              "trendingRank": "热搜澄清"
            },
            {
              "id": "BM-3B",
              "role": "区公安分局",
              "category": "field_operation",
              "branchKey": "negative_b",
              "title": "措施 3-B：公安出动防暴力量驱散哭闹家属 + 教育局推诿回避 + 封群删帖",
              "type": "negative",
              "delta": -30,
              "branchName": "走向 3-B (矛盾激化境外介入)",
              "desc": "强力手段压制家属情绪，各部门默不作声，被扣上“掩盖黑产、镇压百姓”恶名，境外媒体介入造谣。",
              "statement": "",
              "trendingPlatform": "",
              "trendingRank": ""
            }
          ],
          "statements": [
            "教育局核查通报",
            "住建局对涉事物业立案调查通告"
          ]
        }
      },
      {
        "id": "STAGE-04",
        "name": "阶段四：恶性造谣与辟谣执法",
        "startTime": "2026-04-09 07:00",
        "endTime": "2026-04-09 12:00",
        "isCrossDay": false,
        "timeTag": "04-09 07:00 ~ 12:00",
        "summary": "网络造谣“抬了20多个担架”、“据说死了50人”，点点迷信协同溯源，公安选用警情通报模版依法拘留造谣者。",
        "selectedBranch": "branch_a",
        "confrontations": [
          {
            "id": "CF-401",
            "time": "07:15",
            "stageId": "STAGE-04",
            "stageName": "阶段四：恶性造谣与辟谣执法",
            "red": {
              "id": "RP-401",
              "role": "抖音造谣网民“小飞飞”",
              "author": "小飞飞 (张某)",
              "avatar": "🚨",
              "platform": "潇湘晨报评论区",
              "content": "“我就在对面小区住，亲眼看到来了好多消防员，担架都抬了二十多个，应该死了不少人！” (获点赞6820条)",
              "assetId": "",
              "assetName": "",
              "penalty": -15,
              "trendingPlatform": "douyin",
              "trendingRank": "Top 2 (热)"
            },
            "blues": []
          },
          {
            "id": "CF-402",
            "time": "08:00",
            "stageId": "STAGE-04",
            "stageName": "阶段四：恶性造谣与辟谣执法",
            "red": null,
            "blues": [
              {
                "id": "BM-4A1",
                "role": "市委网信辟谣专班",
                "author": "网信辟谣专班",
                "avatar": "👑",
                "category": "diandian_dispatch",
                "platform": "点点密信内部指令",
                "title": "【点点密信指令】指令公安网安锁定“小飞飞”账号IP与真实身份",
                "statement": "【点点密信指令】@区公安分局网安大队：请立即对抖音造谣账号“小飞飞”进行溯源落地，锁定造谣者现住址！",
                "branchName": "走向 4-A1 (技术溯源锁定)",
                "docAssetId": "",
                "delta": 10,
                "trendingPlatform": "",
                "trendingRank": ""
              }
            ]
          },
          {
            "id": "CF-403",
            "time": "08:45",
            "stageId": "STAGE-04",
            "stageName": "阶段四：恶性造谣与辟谣执法",
            "red": {
              "id": "RP-402",
              "role": "微博造谣大V“花花的世界”",
              "author": "花花的世界 (李某)",
              "avatar": "⚡",
              "platform": "新浪微博大V评论区",
              "content": "“一直听到爆炸声，据说死了50人！” (获点赞13941，回复4328条，恐慌跨平台裂变扩散)",
              "assetId": "",
              "assetName": "",
              "penalty": -20,
              "trendingPlatform": "weibo",
              "trendingRank": "Top 1 (爆)"
            },
            "blues": []
          },
          {
            "id": "CF-404",
            "time": "09:30",
            "stageId": "STAGE-04",
            "stageName": "阶段四：恶性造谣与辟谣执法",
            "red": null,
            "blues": [
              {
                "id": "BM-4A2",
                "role": "K市公安局P区分局 (网安/治安)",
                "author": "公安网安支队",
                "avatar": "👮",
                "category": "official_notice",
                "platform": "官方抖音警情通报",
                "templateId": "AST-DOC-02",
                "docAssetId": "AST-DOC-02",
                "title": "【官方通报发布】选用模版《K市公安局P区分局警情通报》(附件二) 拘留张某10日",
                "statement": "【警情通报】经查，网民“小飞飞”（张某，男，32岁）编造散布“担架抬了二十多”虚假谣言，公安机关依法予以行政拘留10日。",
                "branchName": "走向 4-A2 (雷霆打击铁证辟谣)",
                "delta": 20,
                "trendingPlatform": "douyin",
                "trendingRank": "Top 1 (辟谣声明)"
              }
            ]
          },
          {
            "id": "CF-405",
            "time": "10:15",
            "stageId": "STAGE-04",
            "stageName": "阶段四：恶性造谣与辟谣执法",
            "red": null,
            "blues": [
              {
                "id": "BM-4A3",
                "role": "K市公安局P区分局 & 市卫健委",
                "author": "公安与卫健委联合通报",
                "avatar": "🏥",
                "category": "official_notice",
                "platform": "官方微博警情通报",
                "templateId": "AST-DOC-02",
                "docAssetId": "AST-DOC-02",
                "title": "【官方通报发布】公布定点收治医院真实花名册，依法行政拘留李某10日",
                "statement": "【警情通报】违法嫌疑人李某故意编造传播“据说死了50人”虚假谣言，已被依法行政拘留10日。网络不是法外之地！市卫健委公布定点医院真实收治花名册。",
                "branchName": "走向 4-A3 (粉碎恐慌阻断裂变)",
                "delta": 20,
                "trendingPlatform": "weibo",
                "trendingRank": "Top 1 (辟谣声明)"
              }
            ]
          }
        ],
        "redCamp": {
          "roles": [
            {
              "id": "R4-1",
              "name": "抖音造谣网民“小飞飞”",
              "active": true
            },
            {
              "id": "R4-2",
              "name": "微博造谣大V“花花的世界”",
              "active": true
            },
            {
              "id": "R4-3",
              "name": "自媒体“K市小马哥”",
              "active": true
            }
          ],
          "posts": [
            {
              "id": "RP-401",
              "role": "抖音造谣网民“小飞飞”",
              "author": "抖音“小飞飞” (张某)",
              "platform": "潇湘晨报评论区",
              "type": "恶性造谣",
              "penalty": -15,
              "content": "“我就在对面小区住，亲眼看到来了好多消防员，担架都抬了二十多个，应该死了不少人！” (获点赞6820条)",
              "trendingPlatform": "douyin",
              "trendingRank": "Top 2"
            },
            {
              "id": "RP-402",
              "role": "微博造谣大V“花花的世界”",
              "author": "微博“花花的世界” (李某)",
              "platform": "新浪微博大V评论区",
              "type": "恶性造谣",
              "penalty": -20,
              "content": "“一直听到爆炸声，据说死了50人！” (获点赞13941，回复4328条，恐慌跨平台裂变扩散)",
              "trendingPlatform": "weibo",
              "trendingRank": "Top 1"
            }
          ],
          "assets": [
            "AST-005",
            "AST-DOC-02"
          ]
        },
        "blueCamp": {
          "roles": [
            {
              "id": "B4-1",
              "name": "K市公安局P区分局网安大队",
              "active": true
            },
            {
              "id": "B4-2",
              "name": "市卫健委救治数据组",
              "active": true
            },
            {
              "id": "B4-3",
              "name": "市委网信辟谣专班",
              "active": true
            }
          ],
          "measures": [
            {
              "id": "BM-4A2",
              "role": "K市公安局P区分局网安大队",
              "category": "official_notice",
              "templateId": "AST-DOC-02",
              "docAssetId": "AST-DOC-02",
              "branchKey": "positive_a",
              "title": "【官方通报发布】选用模版《K市公安局P区分局警情通报》(附件二) 拘留张某10日",
              "type": "positive",
              "delta": 20,
              "branchName": "走向 4-A2 (雷霆打击铁证辟谣)",
              "desc": "卫健委公布救治花名册佐证4死21伤真实底数；公安雷霆出击传唤张某、李某，依治安管理处罚法拘留10日。",
              "statement": "【警情通报】经查，网民“小飞飞”（张某）、“花花的世界”（李某）编造传播“担架抬了二十多”、“据说死了50人”虚假谣言，公安机关依法予以行政拘留。",
              "trendingPlatform": "douyin",
              "trendingRank": "Top 1 (辟谣声明)"
            },
            {
              "id": "BM-4B",
              "role": "应急值班席",
              "category": "field_operation",
              "branchKey": "negative_b",
              "title": "措施 4-B：仅发文“不信谣不传谣”套话 + 无救治数据支撑 + 未查处造谣者",
              "type": "negative",
              "delta": -20,
              "branchName": "走向 4-B (公众存疑谣言坐实)",
              "desc": "缺乏有力事实反驳，未公开定点医院救治数据，公众认定官方掩盖真相，“死50人”成为民间既成定论。",
              "statement": "",
              "trendingPlatform": "",
              "trendingRank": ""
            }
          ],
          "statements": [
            "第二期：K市公安局P区分局《警情通报》"
          ]
        }
      },
      {
        "id": "STAGE-05",
        "name": "阶段五：新闻发布会与善后定调",
        "startTime": "2026-04-09 12:00",
        "endTime": "2026-04-09 17:00",
        "isCrossDay": false,
        "timeTag": "04-09 12:00 ~ 17:00",
        "summary": "联合调查组召开新闻发布会，通报燃气爆燃定性、消防生命通道整治、媒体采访知情权保障。",
        "selectedBranch": "branch_a",
        "confrontations": [
          {
            "id": "CF-501",
            "time": "13:30",
            "stageId": "STAGE-05",
            "stageName": "阶段五：新闻发布会与善后定调",
            "red": {
              "id": "RP-501",
              "role": "现场主流媒体与行业记者团",
              "author": "媒体记者连环质询",
              "avatar": "🎤",
              "platform": "新闻发布会提问席",
              "content": "“起火原因到底是不是燃气爆炸？” “物业去年合格检查是否存在猫腻？” “现场个别安保抢夺记者摄像机如何处理？”",
              "assetId": "",
              "assetName": "",
              "penalty": -15,
              "trendingPlatform": "toutiao",
              "trendingRank": "Top 3 (热)"
            },
            "blues": []
          },
          {
            "id": "CF-502",
            "time": "14:30",
            "stageId": "STAGE-05",
            "stageName": "阶段五：新闻发布会与善后定调",
            "red": null,
            "blues": [
              {
                "id": "BM-5A1",
                "role": "联合调查组新闻发言人 (常务副区长)",
                "author": "官方新闻发言人",
                "avatar": "🏛️",
                "category": "press_conf",
                "platform": "新闻发布会全网直播",
                "title": "【新闻发布会】全体肃立默哀 + 权威定性燃气爆燃 + 为推搡记者诚恳致歉",
                "statement": "【发布会统发口径】起火原因系23层住宅东侧燃气爆燃；全区开展消防生命通道大清障；对抢夺记者设备涉事人员严肃处分，捍卫公众知情权。",
                "branchName": "走向 5-A1 (担当诚恳主动定调)",
                "docAssetId": "",
                "delta": 25,
                "trendingPlatform": "weibo",
                "trendingRank": "Top 1 (权威置顶)"
              }
            ]
          },
          {
            "id": "CF-503",
            "time": "15:15",
            "stageId": "STAGE-05",
            "stageName": "阶段五：新闻发布会与善后定调",
            "red": null,
            "blues": [
              {
                "id": "BM-5A2",
                "role": "区消防救援大队大队长",
                "author": "消防大队长",
                "avatar": "🚒",
                "category": "press_conf",
                "platform": "新闻发布会答记者问",
                "title": "【新闻发布会】详细解答消火栓水压与登高救援科学施救事实",
                "statement": "【答记者问】现场共出动3个消防救援站、8辆大跨度登高灭火平台车，首支水枪出水时间为19时08分，物业虚假签名已依法由监察机关立案。",
                "branchName": "走向 5-A2 (专业释疑回应当面关切)",
                "docAssetId": "",
                "delta": 15,
                "trendingPlatform": "baidu",
                "trendingRank": "同城榜首"
              }
            ]
          }
        ],
        "redCamp": {
          "roles": [
            {
              "id": "R5-1",
              "name": "现场提问记者团 (主流媒体+行业媒体)",
              "active": true
            },
            {
              "id": "R5-2",
              "name": "网络直播间围观舆论群体",
              "active": true
            }
          ],
          "posts": [
            {
              "id": "RP-501",
              "role": "现场提问记者团",
              "author": "媒体记者连环追问",
              "platform": "发布会现场提问",
              "type": "犀利质询",
              "penalty": -15,
              "content": "“起火原因到底是不是燃气爆炸？” “物业去年合格检查是否存在猫腻？” “现场个别安保抢夺记者摄像机如何处理？”",
              "trendingPlatform": "toutiao",
              "trendingRank": "Top 3"
            }
          ],
          "assets": []
        },
        "blueCamp": {
          "roles": [
            {
              "id": "B5-1",
              "name": "联合调查组新闻发言人 (区委常委/常务副区长)",
              "active": true
            },
            {
              "id": "B5-2",
              "name": "区消防救援大队大队长",
              "active": true
            },
            {
              "id": "B5-3",
              "name": "区公安分局副局长",
              "active": true
            },
            {
              "id": "B5-4",
              "name": "区住建局局长",
              "active": true
            }
          ],
          "measures": [
            {
              "id": "BM-5A1",
              "role": "联合调查组新闻发言人 (区委常委/常务副区长)",
              "category": "press_conf",
              "branchKey": "positive_a",
              "title": "【新闻发布会】起立默哀 + 权威定性燃气爆燃 + 启动全区生命通道清障 + 为推搡记者诚恳致歉",
              "type": "positive",
              "delta": 25,
              "branchName": "走向 5-A1 (担当诚恳舆论降温)",
              "desc": "发布会直面质疑，发言人肃立默哀，公布23层东侧燃气爆燃原因；承诺倒查物业；公开就记者遇阻致歉并推出采访保障机制。",
              "statement": "【发布会统发稿】起火原因系23层住宅东侧燃气爆燃；全区开展消防生命通道大清障；对抢夺记者设备涉事人员严肃处分，捍卫公众知情权。",
              "trendingPlatform": "weibo",
              "trendingRank": "Top 1 (权威置顶)"
            },
            {
              "id": "BM-5B",
              "role": "发布会联络席",
              "category": "field_operation",
              "branchKey": "negative_b",
              "title": "措施 5-B：通篇照念官僚套话 + 回避生命通道与抢设备问题 + 提前掐断记者提问",
              "type": "negative",
              "delta": -25,
              "branchName": "走向 5-B (发布会沦为灾难现场)",
              "desc": "态度傲慢推诿，回答提问避重就轻，提问环节仅安排托儿提问，被网民截取表情包全网二次批判。",
              "statement": "",
              "trendingPlatform": "",
              "trendingRank": ""
            }
          ],
          "statements": [
            "第三期：火灾事故联合调查组新闻发布会统发稿与答问口径"
          ]
        }
      }
    ],
    "subtype": "高层住宅火灾爆燃与涉灾造谣应对"
  },
  {
    "id": "JB-CARD-TOUR-2026",
    "name": "【卡牌对抗】A市花园景区安保涉暴舆情阻击战",
    "type": "tourism_security",
    "typeName": "文化旅游与社会治安",
    "category": "card_battle",
    "categoryName": "🎴 卡牌对抗类 (多人身份博弈)",
    "mode": "card_battle",
    "difficulty": "hard",
    "duration": 60,
    "startDate": "2026-07-23",
    "endDate": "2026-07-25",
    "virtualDuration": 48,
    "timeSpeed": 24,
    "credibilityBaseline": 100,
    "initialHP": 100,
    "totalCardCount": 56,
    "aiCardCount": 16,
    "playerCardCount": 40,
    "status": "active",
    "updatedAt": "2026-10-14 09:30",
    "creator": "市委网信办·导调组",
    "coverUrl": "./media/scenic_cover.jpg",
    "bgUrl": "./media/scenic_bg.jpg",
    "bgDesc": "2026年7月23日17时10分，A市花园景区入口，景区多名安保、票务工作人员因核验和停车争执与旅游车司机爆发冲突，涉暴/涉爆舆情迅速发酵，现场被游客拍下清晰短视频上传抖音，引发全网对景区暴力服务与文旅监管缺失的强烈声讨。",
    "gameRules": {
      "mode": "多人多身份卡牌对抗 (人机随机博弈)",
      "initialHP": 100,
      "passAllowed": true,
      "passRuleDesc": "当前轮次学员可战略性选择【跳过不出】，保存手牌至后续高危阶段，由队友补位或由团队承受小额血量扣减。",
      "stageThresholds": [
        {
          "stageIndex": 1,
          "thresholdHP": 75,
          "desc": "初发期需坚守 75 HP 以上，低于 75 舆情蔓延失控淘汰"
        },
        {
          "stageIndex": 2,
          "thresholdHP": 55,
          "desc": "发酵期需坚守 55 HP 以上，低于 55 危机升级淘汰"
        },
        {
          "stageIndex": 3,
          "thresholdHP": 35,
          "desc": "次生风暴需坚守 35 HP 以上，低于 35 全网声讨淘汰"
        },
        {
          "stageIndex": 4,
          "thresholdHP": 1,
          "desc": "终局收尾需生命槽 > 0 HP，全流程通关大捷"
        }
      ]
    },
    "identities": [
      {
        "id": "ROLE-TOUR-WX",
        "name": "市委宣传部/网信办",
        "dept": "网信指挥席",
        "avatar": "🛡️",
        "roleDesc": "负责全网网络舆情监测感知、敏感信息研判转办、主流媒体共振引导及恶性谣言处置。",
        "handCards": [
          {
            "id": "CD-WX-01",
            "name": "多源舆情实时监测与快速转办派单",
            "category": "special",
            "tag": "案例专项",
            "type": "监测派单",
            "cost": 1,
            "counterAttr": [
              "事实质疑",
              "初始发酵"
            ],
            "effectDesc": "30分钟内核实现场，抑制舆情第一波扩散，防范信息差",
            "power": 20,
            "isTrap": false
          },
          {
            "id": "CD-WX-02",
            "name": "涉暴涉伤恶性谣言全网辟谣弹窗置顶",
            "category": "special",
            "tag": "案例专项",
            "type": "权威辟谣",
            "cost": 2,
            "counterAttr": [
              "虚假伤情谣言",
              "断章造谣"
            ],
            "effectDesc": "粉碎网传'司机内脏破裂脑死亡'等恶性谣言，阻断裂变",
            "power": 25,
            "isTrap": false
          },
          {
            "id": "CD-WX-03",
            "name": "央媒省媒主流阵地联合通稿矩阵分发",
            "category": "special",
            "tag": "案例专项",
            "type": "主流引导",
            "cost": 2,
            "counterAttr": [
              "异地媒体介入",
              "舆论失衡"
            ],
            "effectDesc": "统一权威发声口径，压制营销号带节奏，修复城市形象",
            "power": 25,
            "isTrap": false
          },
          {
            "id": "CD-WX-04",
            "name": "全网敏感词库动态拦截与恶意爬虫限流",
            "category": "general",
            "tag": "通用履职",
            "type": "流量降温",
            "cost": 1,
            "counterAttr": [
              "恶意蹭流",
              "流量水军"
            ],
            "effectDesc": "对借机煽动极端对立的批量水军账号进行限流降权",
            "power": 15,
            "isTrap": false
          },
          {
            "id": "CD-WX-05",
            "name": "第三方网络公信力评估监测报告发布",
            "category": "general",
            "tag": "通用履职",
            "type": "智库支撑",
            "cost": 1,
            "counterAttr": [
              "公正性质疑"
            ],
            "effectDesc": "引入第三方专业智库提供客观公允的舆论研判支撑",
            "power": 15,
            "isTrap": false
          },
          {
            "id": "CD-WX-06",
            "name": "网络文明志愿者与正向网评矩阵启动",
            "category": "general",
            "tag": "通用履职",
            "type": "网评对冲",
            "cost": 1,
            "counterAttr": [
              "情绪煽动",
              "评论区沦陷"
            ],
            "effectDesc": "在微博抖音主流评论区开展理性留言互动，盖楼引导",
            "power": 15,
            "isTrap": false
          },
          {
            "id": "CD-WX-07",
            "name": "政务新媒体全天候在线互动与民意摸排",
            "category": "general",
            "tag": "通用履职",
            "type": "民意沟通",
            "cost": 1,
            "counterAttr": [
              "官方失声质疑"
            ],
            "effectDesc": "官方微博微信24小时回复网民合理关切，消解信息真空",
            "power": 15,
            "isTrap": false
          },
          {
            "id": "CD-WX-08",
            "name": "启动突发事件网络舆情I级联合应急指挥",
            "category": "strategic",
            "tag": "战略应急",
            "type": "战略大招",
            "cost": 3,
            "counterAttr": [
              "全网热搜第一",
              "跨国舆论发酵"
            ],
            "effectDesc": "统筹全市涉舆部门一体化协同联动，强力锁住生命槽",
            "power": 30,
            "isTrap": false
          },
          {
            "id": "CD-WX-09",
            "name": "【误区陷阱】下达封口令要求全网机械删帖封号",
            "category": "trap",
            "tag": "陷阱牌",
            "type": "反噬风险",
            "cost": 1,
            "counterAttr": [],
            "effectDesc": "粗暴压制言论引发舆论彻底反弹，触发'掩盖黑幕'暴击扣血30点！",
            "power": -30,
            "isTrap": true
          },
          {
            "id": "CD-WX-10",
            "name": "【误区陷阱】发布空洞通告'网传不实，请勿传谣'",
            "category": "trap",
            "tag": "陷阱牌",
            "type": "反噬风险",
            "cost": 1,
            "counterAttr": [],
            "effectDesc": "在铁证视频前空洞辟谣遭群嘲打脸，公信力额外受损20点！",
            "power": -20,
            "isTrap": true
          }
        ]
      },
      {
        "id": "ROLE-TOUR-WL",
        "name": "市文旅局/景区管委会",
        "dept": "行业监管与主体席",
        "avatar": "🏞️",
        "roleDesc": "负责景区现场管理处置、涉事安保追责、行业服务整顿及游客权益保障。",
        "handCards": [
          {
            "id": "CD-WL-01",
            "name": "公开景区进门核验全过程完整无剪辑监控",
            "category": "special",
            "tag": "案例专项",
            "type": "还原真相",
            "cost": 2,
            "counterAttr": [
              "断章取义",
              "事实质疑"
            ],
            "effectDesc": "公布完整原画，澄清前因后果，打破自媒体剪辑偏见",
            "power": 25,
            "isTrap": false
          },
          {
            "id": "CD-WL-02",
            "name": "对涉事外包安保人员依法停职、解除合同",
            "category": "special",
            "tag": "案例专项",
            "type": "刀刃向内",
            "cost": 1,
            "counterAttr": [
              "包庇行凶质疑",
              "安保暴力声讨"
            ],
            "effectDesc": "雷霆查处涉事人员，平息公众对景区冷漠护短的怒火",
            "power": 20,
            "isTrap": false
          },
          {
            "id": "CD-WL-03",
            "name": "景区主要分管领导停职反省并当面道歉",
            "category": "special",
            "tag": "案例专项",
            "type": "管理问责",
            "cost": 2,
            "counterAttr": [
              "管理混乱声讨",
              "官僚作风质问"
            ],
            "effectDesc": "严肃追究管理失职，展现行业主管部门不护短的担当",
            "power": 25,
            "isTrap": false
          },
          {
            "id": "CD-WL-04",
            "name": "全市A级景区窗口服务作风与隐患拉网大排查",
            "category": "special",
            "tag": "案例专项",
            "type": "长效整治",
            "cost": 2,
            "counterAttr": [
              "行业黑幕声讨",
              "屡禁不止质疑"
            ],
            "effectDesc": "将单点事故转化为全行业提质升级，阻断同类次生事件",
            "power": 20,
            "isTrap": false
          },
          {
            "id": "CD-WL-05",
            "name": "游客权益受损先行赔付与应急绿色救助基金",
            "category": "general",
            "tag": "通用履职",
            "type": "权益保障",
            "cost": 1,
            "counterAttr": [
              "司机索赔受阻",
              "民事维权难"
            ],
            "effectDesc": "全额承担医药费用及误工损失，消除受害方后顾之忧",
            "power": 15,
            "isTrap": false
          },
          {
            "id": "CD-WL-06",
            "name": "开辟'文旅局长直通车'游客在线投诉专线",
            "category": "general",
            "tag": "通用履职",
            "type": "服务通道",
            "cost": 1,
            "counterAttr": [
              "投诉渠道闭塞"
            ],
            "effectDesc": "2小时内办结游客投诉，扭转公众对文旅行政效率的偏见",
            "power": 15,
            "isTrap": false
          },
          {
            "id": "CD-WL-07",
            "name": "联合携程美团OTA发布客流与履约保障承诺",
            "category": "general",
            "tag": "通用履职",
            "type": "产业托底",
            "cost": 1,
            "counterAttr": [
              "全网退票潮",
              "经济指数受损"
            ],
            "effectDesc": "稳固OTA平台履约率与好评度，遏制退房退票恐慌",
            "power": 15,
            "isTrap": false
          },
          {
            "id": "CD-WL-08",
            "name": "宣布景区限时免门票并举办公开整改观摩日",
            "category": "strategic",
            "tag": "战略应急",
            "type": "战略大招",
            "cost": 3,
            "counterAttr": [
              "抵制全城旅游",
              "公信力破产危机"
            ],
            "effectDesc": "以最大的开放姿态邀请市民与媒体监督，实现口碑逆转",
            "power": 30,
            "isTrap": false
          },
          {
            "id": "CD-WL-09",
            "name": "【误区陷阱】私下与被打司机签订高额封口保密协议",
            "category": "trap",
            "tag": "陷阱牌",
            "type": "反噬风险",
            "cost": 1,
            "counterAttr": [],
            "effectDesc": "被自媒体曝光'花钱买平安'，坐实心虚恶劣行径，暴扣30HP！",
            "power": -30,
            "isTrap": true
          },
          {
            "id": "CD-WL-10",
            "name": "【误区陷阱】声明强辩'司机蛮横在先、安保正当防卫'",
            "category": "trap",
            "tag": "陷阱牌",
            "type": "反噬风险",
            "cost": 1,
            "counterAttr": [],
            "effectDesc": "逆向对线激化公众同情弱者情绪，热搜直接霸榜，扣30HP！",
            "power": -30,
            "isTrap": true
          }
        ]
      },
      {
        "id": "ROLE-TOUR-GA",
        "name": "市公安局辖区分局",
        "dept": "治安执法席",
        "avatar": "👮",
        "roleDesc": "负责现场治安秩序控制、伤情鉴定、嫌疑人刑事/行政处罚及打击造谣黑产。",
        "handCards": [
          {
            "id": "CD-GA-01",
            "name": "出警固定现场证据与受害司机法医伤情鉴定",
            "category": "special",
            "tag": "案例专项",
            "type": "依法取证",
            "cost": 1,
            "counterAttr": [
              "现场围观骚乱",
              "虚假伤情谣言"
            ],
            "effectDesc": "第一时间固定涉案证据与伤情报告，阻断伤情失真猜测",
            "power": 20,
            "isTrap": false
          },
          {
            "id": "CD-GA-02",
            "name": "对多名动手打人安保依法予以行政拘留",
            "category": "special",
            "tag": "案例专项",
            "type": "雷霆执法",
            "cost": 2,
            "counterAttr": [
              "严惩凶手诉求",
              "执法不严声讨"
            ],
            "effectDesc": "依法从严办理违法嫌疑人，顺应公众对公平正义的期盼",
            "power": 25,
            "isTrap": false
          },
          {
            "id": "CD-GA-03",
            "name": "查处编造'司机被打致脑死亡'谣言首发账号",
            "category": "special",
            "tag": "案例专项",
            "type": "打击造谣",
            "cost": 2,
            "counterAttr": [
              "恶性造谣",
              "耸人听闻传言"
            ],
            "effectDesc": "依法传唤造谣博主并公布训诫处罚通报，杀一儆百",
            "power": 25,
            "isTrap": false
          },
          {
            "id": "CD-GA-04",
            "name": "发布公安分局官方警情通报（权威定性）",
            "category": "special",
            "tag": "案例专项",
            "type": "一锤定音",
            "cost": 2,
            "counterAttr": [
              "事实不清质疑",
              "媒体深度追问"
            ],
            "effectDesc": "以法定事实还原案件起因、冲突过程与法律责任界定",
            "power": 25,
            "isTrap": false
          },
          {
            "id": "CD-GA-05",
            "name": "景区重点人流集聚区武装巡逻与见警率提升",
            "category": "general",
            "tag": "通用履职",
            "type": "威慑维稳",
            "cost": 1,
            "counterAttr": [
              "治安恐慌心理"
            ],
            "effectDesc": "派出PTU特警与巡警驻守景区大门，恢复市民安全感",
            "power": 15,
            "isTrap": false
          },
          {
            "id": "CD-GA-06",
            "name": "司法调解委员会进驻快速化解民商事纠纷",
            "category": "general",
            "tag": "通用履职",
            "type": "纠纷调处",
            "cost": 1,
            "counterAttr": [
              "司机群体抱团抗议"
            ],
            "effectDesc": "在派出所设立调解专班，协助双方合法厘清民事赔偿",
            "power": 15,
            "isTrap": false
          },
          {
            "id": "CD-GA-07",
            "name": "交通警察支队优化景区周边大巴落客动线",
            "category": "general",
            "tag": "通用履职",
            "type": "交通疏导",
            "cost": 1,
            "counterAttr": [
              "落客秩序混乱"
            ],
            "effectDesc": "增设大巴专用港湾与智能核验通道，消除拥堵诱因",
            "power": 15,
            "isTrap": false
          },
          {
            "id": "CD-GA-08",
            "name": "对幕后操纵流量黑公关水军立案刑事侦查",
            "category": "strategic",
            "tag": "战略应急",
            "type": "战略大招",
            "cost": 3,
            "counterAttr": [
              "有组织黑公关炒作",
              "恶性流量操纵"
            ],
            "effectDesc": "斩断网络黑灰产推波助澜黑手，彻底瓦解红方攻击阵线",
            "power": 30,
            "isTrap": false
          },
          {
            "id": "CD-GA-09",
            "name": "【误区陷阱】以'双方互殴和解'为由免予拘留仅罚款",
            "category": "trap",
            "tag": "陷阱牌",
            "type": "反噬风险",
            "cost": 1,
            "counterAttr": [],
            "effectDesc": "公众指责'偏袒当地安保'引发民愤，公信力大跌25HP！",
            "power": -25,
            "isTrap": true
          },
          {
            "id": "CD-GA-10",
            "name": "【误区陷阱】粗暴扣押现场拍照游客手机强制删除视频",
            "category": "trap",
            "tag": "陷阱牌",
            "type": "反噬风险",
            "cost": 1,
            "counterAttr": [],
            "effectDesc": "公然侵犯公民权利被拍下曝光，引发全国法学大V围剿，扣35HP！",
            "power": -35,
            "isTrap": true
          }
        ]
      },
      {
        "id": "ROLE-TOUR-XW",
        "name": "市政府新闻发言人/融媒体",
        "dept": "新闻发布与媒体沟通席",
        "avatar": "🎙️",
        "roleDesc": "负责突发事件权威信息发布、异地主流记者突袭答复、新闻发布会主持及媒体关系统筹。",
        "handCards": [
          {
            "id": "CD-XW-01",
            "name": "极目新闻记者突击电话专访标准规范答复",
            "category": "special",
            "tag": "案例专项",
            "type": "电话答疑",
            "cost": 1,
            "counterAttr": [
              "媒体突击电访",
              "极目新闻追问"
            ],
            "effectDesc": "严格按事实表态，既不失声也不妄断，赢得媒体认同",
            "power": 20,
            "isTrap": false
          },
          {
            "id": "CD-XW-02",
            "name": "联合工作组首期诚恳情况说明与致歉公函",
            "category": "special",
            "tag": "案例专项",
            "type": "首期通报",
            "cost": 2,
            "counterAttr": [
              "初发舆情扩散",
              "官方态度质疑"
            ],
            "effectDesc": "以官方联合工作组主体发声，表达痛心自责，通报核查进展",
            "power": 25,
            "isTrap": false
          },
          {
            "id": "CD-XW-03",
            "name": "召开突发事件全网现场新闻发布会",
            "category": "special",
            "tag": "案例专项",
            "type": "现场发布会",
            "cost": 3,
            "counterAttr": [
              "全国热搜霸榜",
              "央省媒体深度质询"
            ],
            "effectDesc": "面向百家媒体直面尖锐提问，一锤定音回应社会各界关切",
            "power": 30,
            "isTrap": false
          },
          {
            "id": "CD-XW-04",
            "name": "设立媒体现场接待中心保障正规记者知情权",
            "category": "general",
            "tag": "通用履职",
            "type": "媒体服务",
            "cost": 1,
            "counterAttr": [
              "记者采访受阻抱怨"
            ],
            "effectDesc": "专人对接异地媒体采访需求，提供规范素材，避免摩擦",
            "power": 15,
            "isTrap": false
          },
          {
            "id": "CD-XW-05",
            "name": "邀请法学专家与文旅学者作客直播间视读",
            "category": "general",
            "tag": "通用履职",
            "type": "专家借嘴",
            "cost": 1,
            "counterAttr": [
              "法理责任争议"
            ],
            "effectDesc": "借助高校法学院教授客观阐释法律定性，平息激进情绪",
            "power": 15,
            "isTrap": false
          },
          {
            "id": "CD-XW-06",
            "name": "发布受伤司机救治出院与康复探望跟踪视频",
            "category": "general",
            "tag": "通用履职",
            "type": "暖新闻引导",
            "cost": 1,
            "counterAttr": [
              "家属悲情牌炒作"
            ],
            "effectDesc": "镜头记录各方真诚关怀与妥善救治，传递执法温度",
            "power": 15,
            "isTrap": false
          },
          {
            "id": "CD-XW-07",
            "name": "市融媒体中心推出'文旅温度与基层治理'纪实",
            "category": "general",
            "tag": "通用履职",
            "type": "深度报道",
            "cost": 1,
            "counterAttr": [
              "全域形象污名化"
            ],
            "effectDesc": "全方位展示整改成效与城市文旅底蕴，逐步扭转舆论风向",
            "power": 15,
            "isTrap": false
          },
          {
            "id": "CD-XW-08",
            "name": "市长面对面专题电视问政与全城直播答卷",
            "category": "strategic",
            "tag": "战略应急",
            "type": "战略大招",
            "cost": 3,
            "counterAttr": [
              "政府公信力严重赤字"
            ],
            "effectDesc": "主要领导公开接受市民拷问并立下军令状，彻底重建信任",
            "power": 30,
            "isTrap": false
          },
          {
            "id": "CD-XW-09",
            "name": "【误区陷阱】面对记者连环追问中途甩袖离场拒绝回答",
            "category": "trap",
            "tag": "陷阱牌",
            "type": "反噬风险",
            "cost": 1,
            "counterAttr": [],
            "effectDesc": "产生'发言人拂袖而去'恶性名场面，大屏暴扣30HP！",
            "power": -30,
            "isTrap": true
          },
          {
            "id": "CD-XW-10",
            "name": "【误区陷阱】擅自接受自媒体私下有偿专访独家爆料",
            "category": "trap",
            "tag": "陷阱牌",
            "type": "反噬风险",
            "cost": 1,
            "counterAttr": [],
            "effectDesc": "违反纪律且口径冲突被做成鬼畜全网嘲讽，扣25HP！",
            "power": -25,
            "isTrap": true
          }
        ]
      }
    ],
    "stages": [
      {
        "id": "STAGE-TOUR-01",
        "name": "阶段一：初发舆情发现与核实",
        "timeTag": "07-23 17:10 ~ 17:30",
        "thresholdHP": 75,
        "summary": "抖音短视频首发安保推搡殴打司机画面，点赞破万；网信捕捉敏感线索；蓝方需在不失分超过25分的前提下迅速核查定性。",
        "aiDeck": [
          {
            "id": "AI-TOUR-101",
            "name": "抖音爆料: 景区工作人员公然殴打游客司机视频",
            "attackType": "事实质疑",
            "damage": 20,
            "desc": "视频播放68万，点赞1.1万，评论区骂声一片，公众要求公布起因",
            "vulnerabilities": [
              "CD-WX-01",
              "CD-WL-01",
              "CD-GA-01"
            ],
            "backfireCards": [
              "CD-WX-10",
              "CD-WL-10"
            ]
          },
          {
            "id": "AI-TOUR-102",
            "name": "网民跟帖: 传言司机已被打断肋骨、内脏破裂送医",
            "attackType": "虚假伤情谣言",
            "damage": 15,
            "desc": "虚假伤情迅速扩散，激发同情弱者情绪，要求严惩凶手",
            "vulnerabilities": [
              "CD-GA-01",
              "CD-WX-02"
            ],
            "backfireCards": [
              "CD-GA-09"
            ]
          },
          {
            "id": "AI-TOUR-103",
            "name": "现场围观游客跟评: 保安态度极度蛮横，还扬言打死算我的",
            "attackType": "情绪煽动",
            "damage": 15,
            "desc": "多条评论证实安保粗暴言行，激起对景区常态化管理质疑",
            "vulnerabilities": [
              "CD-WL-02",
              "CD-XW-02"
            ],
            "backfireCards": [
              "CD-WL-10"
            ]
          },
          {
            "id": "AI-TOUR-104",
            "name": "同城生活论坛大V发帖: 花园景区早就该整顿了，天下苦其久矣",
            "attackType": "初始发酵",
            "damage": 10,
            "desc": "本地自媒体开始带节奏翻旧账，扩散同城朋友圈",
            "vulnerabilities": [
              "CD-WX-04",
              "CD-WL-04",
              "CD-WX-06"
            ],
            "backfireCards": [
              "CD-WX-09"
            ]
          }
        ],
        "confrontations": []
      },
      {
        "id": "STAGE-TOUR-02",
        "name": "阶段二：舆情发酵与暗访陷阱",
        "timeTag": "07-23 19:00 ~ 21:00",
        "thresholdHP": 55,
        "summary": "自媒体暗访遭遇雷人回应；热搜登上同城TOP3；异地媒体介入；蓝方需保持生命槽不低于 55 HP。",
        "aiDeck": [
          {
            "id": "AI-TOUR-201",
            "name": "自媒体采访雷人回应: '小事没必要炒作，网友看热闹跟风'",
            "attackType": "情绪煽动",
            "damage": 25,
            "desc": "管理人员不当采访画面被上传，舆论矛头直指官方傲慢冷血",
            "vulnerabilities": [
              "CD-WL-03",
              "CD-XW-02",
              "CD-WL-01"
            ],
            "backfireCards": [
              "CD-WX-09",
              "CD-WL-10"
            ]
          },
          {
            "id": "AI-TOUR-202",
            "name": "网民深扒黑料: 整理景区近3年乱收费、强制乘车等投诉全景",
            "attackType": "行业黑幕声讨",
            "damage": 20,
            "desc": "话题延伸为'景区暴力垄断服务乱象'，阅读量破2200万",
            "vulnerabilities": [
              "CD-WL-04",
              "CD-WL-06",
              "CD-GA-02"
            ],
            "backfireCards": [
              "CD-WL-09"
            ]
          },
          {
            "id": "AI-TOUR-203",
            "name": "异地媒体跟进报道: 《A市花园景区发生安保与司机冲突事件》",
            "attackType": "异地媒体介入",
            "damage": 15,
            "desc": "客观短讯突破地域圈层，开始引发省外主流媒体关注",
            "vulnerabilities": [
              "CD-XW-04",
              "CD-WX-03"
            ],
            "backfireCards": [
              "CD-XW-09"
            ]
          },
          {
            "id": "AI-TOUR-204",
            "name": "微博同城热搜霸榜: #花园景区工作人员打人# 登顶TOP1",
            "attackType": "流量冲顶",
            "damage": 20,
            "desc": "24小时话题讨论量超3.8万条，出现少量地域黑对立言论",
            "vulnerabilities": [
              "CD-WX-04",
              "CD-GA-04",
              "CD-WX-06"
            ],
            "backfireCards": [
              "CD-WX-10"
            ]
          }
        ],
        "confrontations": []
      },
      {
        "id": "STAGE-TOUR-03",
        "name": "阶段三：次生风暴与全网攻坚",
        "timeTag": "07-24 00:00 ~ 18:00",
        "thresholdHP": 35,
        "summary": "主话题登顶全国热搜TOP5，阅读破3.2亿；全网出现抵制旅游与退票潮；极目新闻突击电访；蓝方必须坚守 35 HP 决胜底线。",
        "aiDeck": [
          {
            "id": "AI-TOUR-301",
            "name": "极目新闻记者电话突袭: 追问冲突诱因与为何迟迟不见监控",
            "attackType": "媒体突击电访",
            "damage": 20,
            "desc": "记者连环质问打人安保处理情况及伤情，限时要求官方答复",
            "vulnerabilities": [
              "CD-XW-01",
              "CD-GA-04"
            ],
            "backfireCards": [
              "CD-XW-09"
            ]
          },
          {
            "id": "AI-TOUR-302",
            "name": "全国热搜引爆退票风暴: #抵制A市旅游# 话题阅读破3.2亿",
            "attackType": "全网热搜第一",
            "damage": 30,
            "desc": "事件演化为全域文旅形象危机，携程美团大量订单退订",
            "vulnerabilities": [
              "CD-WX-08",
              "CD-WL-07",
              "CD-XW-03"
            ],
            "backfireCards": [
              "CD-WX-09",
              "CD-WL-09"
            ]
          },
          {
            "id": "AI-TOUR-303",
            "name": "恶性煽动: 营销号批量发布'别去A市，去了要挨打'恐慌视频",
            "attackType": "有组织黑公关炒作",
            "damage": 25,
            "desc": "流量账号刻意制造地域对立收割流量，损害全市法治营商环境",
            "vulnerabilities": [
              "CD-GA-08",
              "CD-GA-03",
              "CD-WX-03"
            ],
            "backfireCards": [
              "CD-GA-10"
            ]
          },
          {
            "id": "AI-TOUR-304",
            "name": "外媒与境外社交平台借题发挥抹黑公共安全环境",
            "attackType": "跨国舆论发酵",
            "damage": 25,
            "desc": "境外账号断章取义炒作社会治安治理问题，引发涉外舆论关切",
            "vulnerabilities": [
              "CD-WX-08",
              "CD-XW-03"
            ],
            "backfireCards": [
              "CD-WX-10"
            ]
          }
        ],
        "confrontations": []
      },
      {
        "id": "STAGE-TOUR-04",
        "name": "阶段四：联合定调与长效修复",
        "timeTag": "07-25 全天",
        "thresholdHP": 1,
        "summary": "市委市政府联合工作组发布终极调查与追责通报，公布安保拘留与全域整改；最终生命槽大于 0 HP 即判定通关大捷。",
        "aiDeck": [
          {
            "id": "AI-TOUR-401",
            "name": "知名法学博主发文质疑: '专项整治会不会又是一阵风形式主义？'",
            "attackType": "长效公正质疑",
            "damage": 15,
            "desc": "舆论进入冷静反思期，关注后续法规制度与服务标准是否真落实",
            "vulnerabilities": [
              "CD-WL-04",
              "CD-XW-05",
              "CD-XW-08"
            ],
            "backfireCards": [
              "CD-WX-10"
            ]
          },
          {
            "id": "AI-TOUR-402",
            "name": "网民深究: 受害司机是否受到隐形施压与赔偿是否到位",
            "attackType": "司法公正关切",
            "damage": 15,
            "desc": "关切弱势群体真实处境，要求公开赔付明细与康复进展",
            "vulnerabilities": [
              "CD-WL-05",
              "CD-GA-06",
              "CD-XW-06"
            ],
            "backfireCards": [
              "CD-WL-09"
            ]
          },
          {
            "id": "AI-TOUR-403",
            "name": "主流财经媒体复盘: 景区过度外包物业管理背后的治理黑洞",
            "attackType": "深度剖析报道",
            "damage": 10,
            "desc": "深度调查探讨文旅企业外包人员用工培训不达标等行业顽疾",
            "vulnerabilities": [
              "CD-WL-08",
              "CD-XW-07"
            ],
            "backfireCards": []
          },
          {
            "id": "AI-TOUR-404",
            "name": "零星残余质疑与自媒体跟风评论长尾波动",
            "attackType": "长尾杂音",
            "damage": 10,
            "desc": "偶发跟评讨论，全网舆情声量持续平稳回落至正常基准线",
            "vulnerabilities": [
              "CD-WX-06",
              "CD-WL-07"
            ],
            "backfireCards": []
          }
        ],
        "confrontations": []
      }
    ],
    "subtype": "景区门禁安保冲突涉暴/涉爆舆情阻击"
  }
];

window.getDrillCartridges = function() {
  let cartridges = null;
  const validIds = ['JB-FIRE-20250408', 'JB-CARD-TOUR-2026'];
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('battle_drill_cartridges');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // 只保留常规推演类火灾剧本与卡牌对抗类花园景区安保涉爆舆情剧本
          const filtered = parsed.filter(c => validIds.includes(c.id));
          if (filtered.length === validIds.length) {
            cartridges = filtered;
          }
        }
      }
    }
  } catch (e) {}
  if (!cartridges || cartridges.length !== 2) {
    cartridges = JSON.parse(JSON.stringify(window.DEFAULT_DRILL_CARTRIDGES));
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('battle_drill_cartridges', JSON.stringify(cartridges));
      }
    } catch (e) {}
  }
  // 确保两个剧本的类型体系与封面背景保持最新
  cartridges.forEach(c => {
    if (c.id === 'JB-FIRE-20250408') {
      c.coverUrl = './media/fire_cover.jpg';
      c.bgUrl = './media/fire_bg.jpg';
      c.type = 'city_safety';
      c.typeName = '城市安全与突发防灾';
      c.subtype = '高层住宅火灾爆燃与涉灾造谣应对';
    } else if (c.id === 'JB-CARD-TOUR-2026') {
      c.coverUrl = './media/scenic_cover.jpg';
      c.bgUrl = './media/scenic_bg.jpg';
      c.type = 'tourism_security';
      c.typeName = '文化旅游与社会治安';
      c.subtype = '景区门禁安保冲突涉暴/涉爆舆情阻击';
      if (!c.bgDesc || !c.bgDesc.includes('涉暴/涉爆')) {
        c.bgDesc = '2026年7月23日17时10分，A市花园景区入口，景区多名安保、票务工作人员因核验和停车争执与旅游车司机爆发冲突，涉暴/涉爆舆情迅速发酵，现场被游客拍下清晰短视频上传抖音，引发全网对景区暴力服务与文旅监管缺失的强烈声讨。';
      }
    }
    if (c.category === 'card_battle') {
      if (!c.totalCards) {
        let roleCards = 0;
        if (c.identities) c.identities.forEach(r => roleCards += (r.handCards ? r.handCards.length : 0));
        let aiCards = 0;
        if (c.stages) c.stages.forEach(s => aiCards += (s.aiDeck ? s.aiDeck.length : 0));
        c.totalCards = roleCards + aiCards;
      }
      if (c.stages) {
        c.stages.forEach(s => {
          if (s.survivalThreshold === undefined && s.thresholdHP !== undefined) {
            s.survivalThreshold = s.thresholdHP;
          }
          if (s.thresholdHP === undefined && s.survivalThreshold !== undefined) {
            s.thresholdHP = s.survivalThreshold;
          }
        });
      }
    }
  });
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('battle_drill_cartridges', JSON.stringify(cartridges));
    }
  } catch (e) {}
  return cartridges;
};

window.saveDrillCartridges = function(cartridges) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('battle_drill_cartridges', JSON.stringify(cartridges));
    }
  } catch (e) {}
};
