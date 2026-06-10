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
  'hero.slide1': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1920&q=80',
  'hero.slide2': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1920&q=80',
  'hero.slide3': 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1920&q=80',

  // ========== 业务卡片头图（600×400）==========
  'service.maintenance':   'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop&q=80',
  'service.programming':   'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop&q=80',
  'service.integration':   'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&h=400&fit=crop&q=80',
  'service.spareparts':    'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=600&h=400&fit=crop&q=80',
  'service.refurbishment': 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600&h=400&fit=crop&q=80',
  'service.sales':         'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop&q=80',

  // ========== 案例默认封面（800×500）==========
  'case.default': 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&h=500&fit=crop&q=80',

  // ========== 微信二维码（400×400 PNG）==========
  'qr.engineer1': 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https://work.weixin.qq.com/contact/engineer-zhang',
  'qr.engineer2': 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https://work.weixin.qq.com/contact/engineer-li',
}

/** 根据 key 获取图片 URL */
export function img(key) {
  return images[key] || ''
}

/** 案例图片：优先自身 image，否则用默认图 */
export function caseImg(caseImage) {
  return caseImage || images['case.default']
}
