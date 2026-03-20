# AINova Club - Supabase 配置指南

## 📋 步骤 1：运行数据库 Schema

1. 访问 Supabase Dashboard: https://app.supabase.com
2. 选择项目 `ainova-club`
3. 进入 **SQL Editor**（左侧菜单）
4. 点击 **New Query**
5. 复制 `supabase-schema.sql` 文件的全部内容
6. 粘贴到 SQL Editor
7. 点击 **Run** 执行

✅ 完成后会看到：
- 3 张表：events, registrations, gallery_photos
- 示例数据：2 个活动

---

## 📋 步骤 2：创建管理员账号

1. 在 Supabase Dashboard 进入 **Authentication** → **Users**
2. 点击 **Add user** → **Create new user**
3. 填写：
   - **Email**: `admin@ainova.club`（或你的邮箱）
   - **Password**: （设置一个强密码，请保存好）
   - **Auto Confirm User**: ✅ 勾选
4. 点击 **Create user**

✅ 现在可以用这个账号登录管理员后台了！

---

## 📋 步骤 3：创建存储桶（照片上传）

1. 在 Supabase Dashboard 进入 **Storage**
2. 点击 **New bucket**
3. 填写：
   - **Name**: `gallery-photos`
   - **Public**: ✅ 勾选（公开访问）
4. 点击 **Create bucket**

✅ 照片存储桶创建完成！

---

## 📋 步骤 4：测试管理员后台

### 访问地址

管理员后台：https://alanwei1988-hub.github.io/ainova-club/admin/

### 登录测试

1. 用步骤 2 创建的账号登录
2. 查看 **活动管理** - 应该看到 2 个示例活动
3. 查看 **报名数据** - 应该看到空列表（还没有报名）
4. 查看 **照片管理** - 应该看到空列表

---

## 📋 步骤 5：测试前台报名

1. 访问前台网站：https://alanwei1988-hub.github.io/ainova-club/
2. 点击 **REGISTER_** 按钮
3. 填写表单并提交
4. 回到管理员后台查看报名数据

✅ 如果能看到报名数据，说明前后端连接成功！

---

## 🔔 步骤 6：配置飞书通知（可选）

### 方案 A：使用 Supabase Edge Function

1. 安装 Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. 初始化项目：
   ```bash
   supabase init
   ```

3. 创建 Edge Function：
   ```bash
   supabase functions new notify-registration
   ```

4. 编写飞书通知代码（我会帮你）

### 方案 B：使用 Webhook 服务

1. 访问 https://webhook.site 或类似服务
2. 获取 Webhook URL
3. 在 Supabase 设置 Database Webhook

---

## 📊 数据库表说明

### events（活动表）
- 存储所有活动信息
- 字段：标题、介绍、地点、时间、人数限制、状态、负责人电话

### registrations（报名表）
- 存储所有报名信息
- 字段：姓名、电话、学校、专业、年级、昵称、报名时间
- 关联：event_id → events.id

### gallery_photos（照片表）
- 存储所有活动照片
- 字段：照片 URL、描述、显示顺序
- 关联：event_id → events.id（可选）

---

## 🎯 下一步功能

1. ✅ 创建活动管理界面（新建/编辑/删除活动）
2. ✅ 实现照片上传功能（拖拽上传）
3. ✅ 导出报名数据（Excel/CSV）
4. ✅ 飞书通知集成
5. ✅ 活动状态管理（upcoming/completed）

---

## 🆘 常见问题

### Q: 登录失败怎么办？
A: 检查邮箱和密码是否正确，确保在 Supabase 中已创建用户

### Q: 报名数据看不到？
A: 检查浏览器控制台是否有错误，确认 Supabase 连接正常

### Q: 如何删除示例数据？
A: 在 Supabase SQL Editor 运行：
```sql
DELETE FROM events;
DELETE FROM registrations;
DELETE FROM gallery_photos;
```

---

## 📞 需要帮助？

随时告诉我配置过程中遇到的问题！🚀
