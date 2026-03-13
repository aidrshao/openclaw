#!/usr/bin/env python3
"""
豆包图片生成 API 脚本
用法: python3 doubao_image.py "<prompt>" [options]

选项:
  --api-key <key>     API密钥 (也可设置环境变量 DOUBAO_API_KEY)
  --model <model>     模型名称 (默认: doubao-seedream-4-5-251128)
  --size <size>       图片尺寸 (默认: 2K)
  --output <path>     输出路径 (默认: ./output.png)
"""

import os
import sys
import json
import argparse
import urllib.request
import urllib.error
from typing import Optional

DEFAULT_API_KEY = "89e3b6aa-9735-49a9-8572-e0252fde1731"
DEFAULT_MODEL = "doubao-seedream-4-5-251128"
DEFAULT_SIZE = "2K"
DEFAULT_OUTPUT = "output.png"
API_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3/images/generations"


def generate_image(
    prompt: str,
    api_key: str = DEFAULT_API_KEY,
    model: str = DEFAULT_MODEL,
    size: str = DEFAULT_SIZE,
    output_path: str = DEFAULT_OUTPUT,
    watermark: bool = True,
    stream: bool = False,
) -> Optional[str]:
    """调用豆包图片生成API"""
    
    # 如果环境变量有API key，优先使用
    env_api_key = os.environ.get("DOUBAO_API_KEY")
    if env_api_key:
        api_key = env_api_key
    
    if not api_key or api_key.strip() == "":
        print("错误: 请设置 API KEY (通过 --api-key 参数或 DOUBAO_API_KEY 环境变量)")
        return None
    
    payload = {
        "model": model,
        "prompt": prompt,
        "sequential_image_generation": "disabled",
        "response_format": "url",
        "size": size,
        "stream": stream,
        "watermark": watermark,
    }
    
    data = json.dumps(payload).encode("utf-8")
    
    req = urllib.request.Request(
        API_BASE_URL,
        data=data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )
    
    try:
        with urllib.request.urlopen(req, timeout=120) as response:
            result = json.loads(response.read().decode("utf-8"))
            
            if "data" in result and len(result["data"]) > 0:
                image_url = result["data"][0].get("url") or result["data"][0].get("b64_json")
                
                # 如果是URL，下载图片
                if result["data"][0].get("url"):
                    print(f"图片生成成功: {image_url}")
                    # 可以选择下载到本地
                    urllib.request.urlretrieve(image_url, output_path)
                    print(f"图片已保存到: {output_path}")
                    return image_url
                elif result["data"][0].get("b64_json"):
                    import base64
                    img_data = base64.b64decode(result["data"][0]["b64_json"])
                    with open(output_path, "wb") as f:
                        f.write(img_data)
                    print(f"图片已保存到: {output_path}")
                    return output_path
            
            print(f"API返回: {result}")
            return None
            
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        print(f"HTTP错误 {e.code}: {error_body}")
        return None
    except Exception as e:
        print(f"错误: {e}")
        return None


def main():
    parser = argparse.ArgumentParser(description="豆包图片生成工具")
    parser.add_argument("prompt", nargs="?", help="图片描述提示词")
    parser.add_argument("--api-key", "-k", default=DEFAULT_API_KEY, help="API密钥")
    parser.add_argument("--model", "-m", default=DEFAULT_MODEL, help="模型名称")
    parser.add_argument("--size", "-s", default=DEFAULT_SIZE, help="图片尺寸")
    parser.add_argument("--output", "-o", default=DEFAULT_OUTPUT, help="输出文件路径")
    parser.add_argument("--no-watermark", action="store_true", help="不添加水印")
    parser.add_argument("--stream", action="store_true", help="流式输出")
    
    args = parser.parse_args()
    
    if not args.prompt:
        # 测试用默认提示词
        args.prompt = "一只可爱的猫咪坐在窗台上，温暖的阳光照进来，电影质感，真实感"
    
    result = generate_image(
        prompt=args.prompt,
        api_key=args.api_key,
        model=args.model,
        size=args.size,
        output_path=args.output,
        watermark=not args.no_watermark,
        stream=args.stream,
    )
    
    if result:
        print(f"\n✅ 图片生成成功!")
        print(f"🔗 {result}")
        return 0
    else:
        print(f"\n❌ 图片生成失败")
        return 1


if __name__ == "__main__":
    sys.exit(main())
