/**
 * 典型案例数据
 * ============================================================
 * 维护方式：直接在下方数组中增删改条目即可，页面自动更新。
 * 后续可替换为远端 JSON / Markdown 加载，接口保持一致。
 *
 * 字段说明：
 *   id          - 唯一标识
 *   title       - 案例标题
 *   industry    - 所属行业（用于标签展示）
 *   image       - 封面图 URL（留空则使用 images.js 中 'case.default' 默认图）
 *   description - 案例简述（控制在 80 字以内）
 *
 * 图片替换：
 *   1. 将案例图片放入 public/images/cases/
 *   2. 下方 image 字段填写 '/images/cases/xxx.jpg'
 *   3. 不填则自动使用 src/data/images.js 中的默认封面
 */

import { caseImg } from './images.js'

export const casesData = [
  {
    id: 1,
    title: '某汽车零部件厂 KUKA 焊接线体年度维保',
    industry: '汽车制造',
    image: '/images/cases/case01.jpg',
    description:
      '为某大型汽车零部件供应商的 12 台 KUKA 焊接机器人提供全年预防性维护，建立数字化维保档案，故障率降低 67%，线体 OEE 提升至 92%。',
  },
  {
    id: 2,
    title: '食品包装线 ABB 高速分拣机器人调试',
    industry: '食品饮料',
    image: '/images/cases/case02.jpg',
    description:
      '完成 6 台 ABB IRB 460 高速分拣机器人的编程调试与节拍优化，单线产能提升 35%，实现全自动码垛与缠绕包装联动。',
  },
  {
    id: 3,
    title: '3C 电子厂 FANUC 搬运工作站系统集成',
    industry: '3C电子',
    image: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&h=500&fit=crop&q=80',
    description:
      '为手机玻璃盖板产线设计 FANUC M-10iA 搬运工作站，集成视觉定位与 PLC 联动，替代 8 名人工上下料，投资回收期仅 11 个月。',
  },
  {
    id: 4,
    title: '工程机械喷涂机器人深度翻新再制造',
    industry: '工程机械',
    image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&h=500&fit=crop&q=80',
    description:
      '对 4 台退役安川 Motoman 喷涂机器人进行深度翻新，更换减速机与管线包，恢复出厂精度并通过 72 小时老化测试，附带 1 年质保。',
  },
  {
    id: 5,
    title: '新能源电池模组搬运与检测系统',
    industry: '新能源',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=500&fit=crop&q=80',
    description:
      '为锂电池模组产线设计 Epson 四轴机器人搬运系统，集成 MES 数据追溯与安全光幕，实现无人化转运，日均处理 12000 枚电芯。',
  },
  {
    id: 6,
    title: '精密铸造厂备品备件年度框架供应',
    industry: '金属加工',
    image: '/images/cases/case06.jpg',
    description:
      '为某精密铸造企业建立关键备件安全库存体系，覆盖减速机、伺服电机、IO 模块等 200+ SKU，紧急交付周期由 7 天缩短至 48 小时。',
  },
]
