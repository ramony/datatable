# Data Table Viewer Chrome Extension

这是一个Chrome浏览器插件，可以读取并展示JSON格式的表格数据。

## 功能特点

- 支持读取本地JSON文件
- 使用Material-UI展示美观的表格
- 支持表格排序（点击表头可排序）
- 支持数据过滤（支持模糊搜索所有字段）
- 支持的JSON格式:   ```json
  {
    "headers": [
      {
        "id": "name",
        "label": "姓名"
      },
      {
        "id": "age",
        "label": "年龄"
      },
      {
        "id": "city",
        "label": "城市"
      }
    ],
    "data": [
      {
        "name": "张三",
        "age": "25",
        "city": "北京"
      },
      {
        "name": "李四",
        "age": "30",
        "city": "上海"
      }
    ]
  }  ```

## 开发环境设置

1. 克隆项目

## 使用方法

1. 在Chrome浏览器中安装此插件
2. 点击插件图标
3. 点击"选择文件"按钮选择JSON文件
4. 数据将以表格形式展示
5. 可以通过以下方式操作数据：
   - 点击表格头部进行排序
   - 使用搜索框过滤数据

## 开发说明

本插件使用以下技术栈：
- React
- Vite
- Material-UI (MUI)
- Chrome Extension API