import { useState } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Tooltip } from '@heroui/tooltip';

interface CodePreviewProps {
  code: string;
  filename?: string;
  onClose?: () => void;
}

export default function CodePreview({ code, filename = 'ssd1677_lut.h', onClose }: CodePreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center w-full">
          <div>
            <h3 className="text-lg font-semibold">C代码预览</h3>
            <p className="text-small text-default-500">
              生成的SSD1677 LUT配置代码
            </p>
          </div>
          <div className="flex gap-2">
            {onClose && (
              <Tooltip content="关闭">
                <Button
                  size="sm"
                  variant="light"
                  isIconOnly
                  onClick={onClose}
                >
                  ✕
                </Button>
              </Tooltip>
            )}
            <Tooltip content={copied ? "已复制!" : "复制代码"}>
              <Button
                size="sm"
                variant="flat"
                color={copied ? "success" : "default"}
                onClick={handleCopy}
              >
                {copied ? "✓" : "📋"} 复制
              </Button>
            </Tooltip>
            <Tooltip content="下载为.h文件">
              <Button
                size="sm"
                variant="flat"
                color="primary"
                onClick={handleDownload}
              >
                💾 下载
              </Button>
            </Tooltip>
          </div>
        </div>
      </CardHeader>
      
      <CardBody>
        <div className="h-full">
          <pre className="bg-default-100 p-4 rounded-lg text-sm font-mono overflow-auto h-full max-h-96 whitespace-pre-wrap">
            <code>{code || '// 点击"生成C代码"按钮来生成代码\n// Click "Generate C Code" to generate code'}</code>
          </pre>
        </div>
      </CardBody>
    </Card>
  );
}
