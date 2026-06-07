-- ShopClip AI database schema
-- Keep API keys out of this schema and out of GitHub. Store keys only in environment variables.

create table if not exists users (
  id varchar(64) primary key,
  name varchar(120) not null,
  email varchar(180) unique,
  role varchar(60) not null default 'Member',
  avatar varchar(20),
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp
);

create table if not exists products (
  id varchar(64) primary key,
  name varchar(180) not null,
  brand varchar(120),
  category varchar(120),
  status varchar(60) not null default '制作中',
  main_image text,
  description text,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp
);

create table if not exists product_assets (
  id varchar(64) primary key,
  product_id varchar(64) references products(id) on delete cascade,
  file_name varchar(240) not null,
  type varchar(80) not null,
  category varchar(120),
  tags text,
  url text,
  uploader varchar(120),
  mime_type varchar(120),
  size_bytes bigint default 0,
  used_count integer not null default 0,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp
);

create table if not exists product_scripts (
  id varchar(64) primary key,
  product_id varchar(64) references products(id) on delete cascade,
  version_label varchar(120) not null,
  note text,
  author varchar(120),
  content_json text not null,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp
);

create table if not exists video_projects (
  id varchar(64) primary key,
  product_id varchar(64) references products(id) on delete set null,
  name varchar(180) not null,
  owner varchar(120),
  status varchar(80) not null default '排队中',
  visibility varchar(60) not null default 'Private',
  progress integer not null default 0,
  ratio varchar(20) not null default '9:16',
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp
);

create table if not exists render_jobs (
  id varchar(64) primary key,
  project_id varchar(64) references video_projects(id) on delete cascade,
  name varchar(180) not null,
  stage varchar(120),
  progress integer not null default 0,
  status varchar(80) not null default '等待中',
  trace_json text,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp
);

create table if not exists agent_conversations (
  id varchar(64) primary key,
  user_id varchar(64) references users(id) on delete set null,
  product_id varchar(64) references products(id) on delete set null,
  project_id varchar(64) references video_projects(id) on delete set null,
  title varchar(180) not null,
  pinned boolean not null default false,
  references_json text,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp
);

create table if not exists agent_messages (
  id varchar(64) primary key,
  conversation_id varchar(64) references agent_conversations(id) on delete cascade,
  role varchar(20) not null check (role in ('user', 'agent')),
  text text not null,
  changes_json text,
  created_at timestamp not null default current_timestamp
);

create table if not exists agent_change_events (
  id varchar(64) primary key,
  conversation_id varchar(64) references agent_conversations(id) on delete cascade,
  message_id varchar(64) references agent_messages(id) on delete cascade,
  type varchar(80) not null,
  target varchar(180) not null,
  summary text,
  new_text text,
  status varchar(40) not null default 'draft',
  created_at timestamp not null default current_timestamp
);

create table if not exists generated_images (
  id varchar(64) primary key,
  conversation_id varchar(64) references agent_conversations(id) on delete set null,
  product_id varchar(64) references products(id) on delete set null,
  title varchar(180) not null,
  style varchar(120),
  prompt text not null,
  image_url text,
  source varchar(80) not null default 'agent',
  selected boolean not null default false,
  created_at timestamp not null default current_timestamp
);

create table if not exists generated_videos (
  id varchar(64) primary key,
  conversation_id varchar(64) references agent_conversations(id) on delete set null,
  source_image_id varchar(64) references generated_images(id) on delete set null,
  prompt text not null,
  duration_seconds integer not null default 6,
  aspect_ratio varchar(20) not null default '9:16',
  motion text,
  status varchar(40) not null default 'draft',
  video_url text,
  storyboard_json text,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp
);

create index if not exists idx_agent_messages_conversation on agent_messages(conversation_id);
create index if not exists idx_agent_changes_conversation on agent_change_events(conversation_id);
create index if not exists idx_generated_images_conversation on generated_images(conversation_id);
create index if not exists idx_generated_videos_conversation on generated_videos(conversation_id);
create index if not exists idx_product_scripts_product on product_scripts(product_id);
create index if not exists idx_video_projects_product on video_projects(product_id);
