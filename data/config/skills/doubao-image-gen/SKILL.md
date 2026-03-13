---
name: doubao-image-gen
description: 使用豆包(Doubao) Seedream 模型生成图片。支持文生图创作,可通过命令行或代码调用。触发场景:(1)用户要求用豆包生成图片 (2)调用 doubao-seedream 图片生成 (3)使用字节豆包API作图
---

# Doubao Image Gen

使用豆包 Seedream 模型生成图片的技能。

## 快速开始

### 命令行方式

```bash
# 基本用法
python3 /home/node/.openclaw/skills/doubao-image-gen/scripts/doubao_image.py "一只可爱的猫咪"

# 指定API Key和参数
python3 /home/node/.openclaw/skills/doubao-image-gen/scripts/doubao_image.py \
  --api-key "your-api-key" \
  --model "doubao-seedream-4-5-251128" \
  --size "2K" \
  --output "output.png" \
  "星际穿越，黑洞，黑洞里冲出一辆快支离破碎的复古列车"
```

### 环境变量方式

```bash
export DOUBAO_API_KEY="your-api-key"
python3 /home/node/.openclaw/skills/doubao-image-gen/scripts/doubao_image.py "你的提示词"
```

## 参数说明

| 参数           | 说明           | 默认值                     |
| -------------- | -------------- | -------------------------- |
| prompt         | 图片描述提示词 | (必填)                     |
| --api-key / -k | API密钥        | YOUR_API_KEY_HERE          |
| --model / -m   | 模型名称       | doubao-seedream-4-5-251128 |
| --size / -s    | 图片尺寸       | 2K                         |
| --output / -o  | 输出文件路径   | output.png                 |
| --no-watermark | 不添加水印     | false                      |
| --stream       | 流式输出       | false                      |

## API 参考

- **API地址**: `https://ark.cn-beijing.volces.com/api/v3/images/generations`
- **认证方式**: `Authorization: Bearer <API_KEY>`
- **模型**: `doubao-seedream-4-5-251128`

### 请求示例

```bash
curl -X POST https://ark.cn-beijing.volces.com/api/v3/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{
    "model": "doubao-seedream-4-5-251128",
    "prompt": "你的图片描述",
    "sequential_image_generation": "disabled",
    "response_format": "url",
    "size": "2K",
    "stream": false,
    "watermark": true
  }'
```

## 提示词技巧

好的提示词应该包含:

- **主体描述**: 要画什么(人物、物体、场景)
- **风格**: 电影质感、OC渲染、光线追踪等
- **氛围**: 暗黑风、温暖、末日感等
- **技术词汇**: 景深、动态模糊、广角透视等增强效果

示例:

> 星际穿越，黑洞，黑洞里冲出一辆快支离破碎的复古列车，抢视觉冲击力，电影大片，末日既视感，动感，对比色，oc渲染，光线追踪，动态模糊，景深，超现实主义，深蓝，画面通过细腻的丰富的色彩层次塑造主体与场景，质感真实，暗黑风背景的光影效果营造出氛围，整体兼具艺术幻想感，夸张的广角透视效果，耀光，反射，极致的光影，强引力，吞噬
