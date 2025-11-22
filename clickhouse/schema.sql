-- ClickHouse schema for Ebuster admin dashboard metrics

CREATE DATABASE IF NOT EXISTS ebuster;
USE ebuster;

-- HTTP access logs for Activity & Users widgets
CREATE TABLE IF NOT EXISTS access_logs
(
  `timestamp`   DateTime           DEFAULT now(),
  `method`      String,
  `path`        String,
  `status_code` UInt16,
  `duration_ms` Float64,
  `user_id`     Nullable(String),
  `ip`          String,
  `user_agent`  String,
  `referer`     String
)
ENGINE = MergeTree
PARTITION BY toYYYYMMDD(timestamp)
ORDER BY (timestamp, path, status_code);

-- Обеспечиваем наличие колонки referer для существующих таблиц
ALTER TABLE access_logs ADD COLUMN IF NOT EXISTS referer String AFTER user_agent;

-- Background jobs for Application widget
CREATE TABLE IF NOT EXISTS jobs
(
  `timestamp`   DateTime DEFAULT now(),
  `job_name`    String,
  `status`      Enum8('failed' = 1, 'processed' = 2, 'released' = 3),
  `duration_ms` Float64
)
ENGINE = MergeTree
PARTITION BY toYYYYMMDD(timestamp)
ORDER BY (timestamp, job_name, status);

-- System logs (errors) for Exceptions metrics
CREATE TABLE IF NOT EXISTS system_logs
(
  `timestamp` DateTime DEFAULT now(),
  `level`     Enum8('INFO' = 1, 'WARNING' = 2, 'ERROR' = 3),
  `message`   String,
  `user_id`   Nullable(String),
  `context`   String
)
ENGINE = MergeTree
PARTITION BY toYYYYMMDD(timestamp)
ORDER BY (timestamp, level);


