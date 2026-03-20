-- AINova Club Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. EVENTS TABLE - 活动表
-- ============================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    capacity INTEGER DEFAULT 30,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
    organizer_phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow public read access to upcoming events
CREATE POLICY "Allow public read access to upcoming events"
    ON events FOR SELECT
    USING (status = 'upcoming' OR status = 'completed');

-- Allow authenticated users full access
CREATE POLICY "Allow authenticated users full access"
    ON events FOR ALL
    USING (auth.role() = 'authenticated');

-- ============================================
-- 2. REGISTRATIONS TABLE - 报名表
-- ============================================
CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    school TEXT,
    major TEXT,
    grade TEXT,
    nickname TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Allow public to insert registrations
CREATE POLICY "Allow public to insert registrations"
    ON registrations FOR INSERT
    WITH CHECK (true);

-- Allow authenticated users to view all registrations
CREATE POLICY "Allow authenticated users to view registrations"
    ON registrations FOR SELECT
    USING (auth.role() = 'authenticated');

-- ============================================
-- 3. GALLERY PHOTOS TABLE - 照片表
-- ============================================
CREATE TABLE gallery_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    caption TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to photos"
    ON gallery_photos FOR SELECT
    USING (true);

-- Allow authenticated users full access
CREATE POLICY "Allow authenticated users full access"
    ON gallery_photos FOR ALL
    USING (auth.role() = 'authenticated');

-- ============================================
-- 4. STORAGE BUCKET - 照片存储
-- ============================================
-- Run this in Supabase Dashboard > Storage
-- Create bucket: 'gallery-photos'
-- Make it public

-- ============================================
-- 5. INDEXES - 索引优化
-- ============================================
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_registrations_event_id ON registrations(event_id);
CREATE INDEX idx_gallery_photos_event_id ON gallery_photos(event_id);
CREATE INDEX idx_gallery_photos_order ON gallery_photos(display_order);

-- ============================================
-- 6. SAMPLE DATA - 示例数据
-- ============================================
INSERT INTO events (title, description, location, event_date, capacity, status, organizer_phone)
VALUES 
(
    'AI Night: Multi-Agent 系统实战',
    '手搓你的第一个 Agent 团队。从 ReAct 到 AutoGen，从概念到代码，三小时硬核 Coding Session。',
    '上海市杨浦区启迪之星孵化器',
    '2026-03-25T19:00:00+08:00',
    30,
    'upcoming',
    '17740803847'
),
(
    'Build Day: 具身智能硬件 Hackathon',
    '带上你的机械臂、树莓派、传感器。现场组队，48 小时原型开发，优刻得算力全力支持。',
    '优刻得 UCloud 会议室',
    '2026-04-02T14:00:00+08:00',
    50,
    'upcoming',
    '17740803847'
);

-- ============================================
-- 7. FUNCTIONS - 数据库函数
-- ============================================
-- Function to send notification on new registration
CREATE OR REPLACE FUNCTION notify_new_registration()
RETURNS TRIGGER AS $$
BEGIN
    -- This will be connected to Supabase Edge Function for Feishu notification
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new registration notification
CREATE TRIGGER on_new_registration
    AFTER INSERT ON registrations
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_registration();

-- ============================================
-- DONE! ✅
-- ============================================
