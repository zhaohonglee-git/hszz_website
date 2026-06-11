/**
 * 图片资源配置（中心化）
 * ============================================================
 * 所有页面图片集中管理。替换图片只需两步：
 *   1. 将新图片放入 public/images/ 对应目录
 *   2. 修改下方对应路径
 *
 * 分辨率要求：
 *   Hero 轮播图    → 1920×1080 (16:9)
 *   业务卡片头图    →  600×400  (3:2)
 *   案例封面图      →  800×500  (8:5)
 *   微信二维码      →  400×400  (1:1)  PNG 格式
 */

export const images = {
  // ========== Hero 轮播背景（1920×1080）==========
  'hero.slide1': '/images/hero/Hero_01.jpg',
  'hero.slide2': '/images/hero/Hero_02.jpg',
  'hero.slide3': '/images/hero/Hero_03.jpg',

  // ========== 业务卡片头图（600×400）==========
  'service.maintenance':   '/images/services/service01.jpg',
  'service.programming':   '/images/services/service02.jpg',
  'service.integration':   '/images/services/service03.jpg',
  'service.spareparts':    '/images/services/service04.jpg',
  'service.refurbishment': '/images/services/service05.jpg',
  'service.sales':         '/images/services/service06.jpg',

  // ========== 案例默认封面（800×500）==========
  'case.default': 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&h=500&fit=crop&q=80',

  // ========== 微信二维码（400×400 PNG）==========
  'qr.engineer1': '/images/qr/张工二维码名片.png',
  'qr.engineer2': '/images/qr/胡工二维码名片.png',
}

/** 根据 key 获取图片 URL */
export function img(key) {
  return images[key] || ''
}

/** 案例图片：优先自身 image，否则用默认图 */
export function caseImg(caseImage) {
  return caseImage || images['case.default']
}
