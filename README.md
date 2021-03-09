# koa-template

Koa 框架的二次封装

## 准备工作

使用之前请务必做以下几件事情：

- 找到 `app/config/` 目录，根据你的项目修改配置（尤其是 `secure.js` 中值为 `env.xxx` 的配置）。
- 其中以 `env.` 为前缀的变量是环境变量，用于保存一些**不可向外界公开的信息（e.g. 连接数据库的账号密码、密钥、等等）**。这些变量需要你自己来定义，具体方法见下一点。
- 在你的项目根目录下，新建一个 `.env` 文件（一定不要有文件名）。然后在新行中以 `NAME=VALUE` 的格式添加变量（这些变量会被 [dotenv](https://github.com/motdotla/dotenv) 自动注入到环境变量中）。例如：

  ```ini
  DB_HOST=localhost
  DB_USER=root
  DB_PASS=123456
  ```

- 根据你在 `.env` 文件中填写的信息，新建 MySQL 数据库。一般来说，新建数据库时，字符集（Character set）选择：`utf8mb4`，字符序（Collation，影响数据库查询时字符的**比较**和**排序**）选择：`utf8mb4_general_ci`。
