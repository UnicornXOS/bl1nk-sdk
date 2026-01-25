// src/lib.rs
use crate::config::ConfigManager;
use crate::acp::AcpEngine;
use crate::error::CoreError;

pub struct Bl1nkCore {
    config: ConfigManager,
    // ... อาจจะมี state อื่นๆ
}

impl Bl1nkCore {
    // โหลด Config ทั้งหมดเมื่อเริ่มต้น
    pub fn new(root_path: &Path) -> Result<Self, CoreError> {
        let config = ConfigManager::load(root_path)?;
        Ok(Self { config })
    }

    // ฟังก์ชันหลักที่โลกภายนอกจะเรียก
    pub async fn delegate_task(&self, agent_name: &str, task: &str) -> Result<String, CoreError> {
        // 1. ใช้ ACP Engine สร้างคำสั่ง
        let command = AcpEngine::prepare_command(&self.config, agent_name, task)?;

        // 2. ใช้ Executor รันคำสั่ง
        let output = execution::run(command).await?;

        Ok(output)
    }

    // อาจจะมีฟังก์ชันอื่นๆ เช่น list_skills(), get_hook_config()
}
