<template>
  <div class="resume-container">
    <div class="resume-header">
      <h1>{{ resumeData.personalInfo?.name || '加载中...' }}</h1>
      <div class="personal-info">
        <span class="info-item">
          <span class="label">求职意向：</span
          >{{ resumeData.personalInfo?.jobTitle }}
        </span>
        <span class="info-item">
          <span class="label">意向城市：</span
          >{{ resumeData.personalInfo?.intendedCity }}
        </span>
        <span class="info-item">
          <span class="label">目前状态：</span
          >{{ resumeData.personalInfo?.currentStatus }}
        </span>
        <span class="info-item">
          <span class="label">年龄：</span>{{ resumeData.personalInfo?.age }}
        </span>
        <span class="info-item">
          <span class="label">手机：</span>{{ resumeData.personalInfo?.phone }}
        </span>
        <span class="info-item">
          <span class="label">微信：</span>
          <span>{{ resumeData.personalInfo?.wechat }}</span>
          <el-popover
            placement="right"
            trigger="hover"
            :width="200"
            popper-class="qr-code-popover"
          >
            <template #reference>
              <img
                class="qr-code-thumbnail"
                :src="resumeData.personalInfo?.qrCode"
                alt="微信二维码"
              />
            </template>
            <img
              :src="resumeData.personalInfo?.qrCode"
              alt="微信二维码"
              style="width: 100%; height: auto"
            />
          </el-popover>
        </span>
        <span class="info-item">
          <span class="label">邮箱：</span>{{ resumeData.personalInfo?.email }}
        </span>
      </div>
      <!-- 隐私信息验证 -->
      <div class="privacy-section">
        <el-button
          v-if="!isAuthenticated"
          type="primary"
          @click="showPasswordDialog = true"
        >
          查看完整信息
        </el-button>
        <el-button type="success" @click="exportPDF"> 导出PDF </el-button>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <template v-else>
      <!-- 自我评价 -->
      <div class="resume-section">
        <h2>自我评价</h2>
        <ul class="self-evaluation">
          <li v-for="(item, index) in resumeData.selfEvaluation" :key="index">
            {{ item }}
          </li>
        </ul>
      </div>

      <!-- 工作经验 -->
      <div class="resume-section">
        <h2>工作经验</h2>
        <div
          v-for="(job, index) in resumeData.workExperience"
          :key="index"
          class="experience-item"
        >
          <div class="experience-header">
            <h3>{{ job.company }}</h3>
            <span class="period">{{ job.period }}</span>
          </div>
          <!-- <p class="position">{{ job.position }}</p> -->
          <ul class="responsibilities">
            <li v-for="(item, idx) in job.responsibilities" :key="idx">
              {{ item }}
            </li>
          </ul>
        </div>
      </div>

      <!-- 项目经验 -->
      <div class="resume-section">
        <h2>项目经验</h2>
        <div
          v-for="(project, index) in resumeData.projectExperience"
          :key="index"
          class="experience-item"
        >
          <div class="experience-header">
            <h3>{{ project.name }}</h3>
            <span class="tech-stack">{{ project.techStack }}</span>
          </div>
          <p class="description">{{ project.description }}</p>
          <ul class="responsibilities">
            <li v-for="(item, idx) in project.responsibilities" :key="idx">
              {{ item }}
            </li>
          </ul>
        </div>
      </div>

      <!-- 个人项目 -->
      <div class="resume-section">
        <h2>个人项目</h2>
        <div
          v-for="(project, index) in resumeData.personalProjects"
          :key="index"
          class="personal-project-item"
        >
          <h3>{{ project.name }}</h3>
          <p class="description">{{ project.description }}</p>
          <a :href="project.url" target="_blank" class="project-link">{{
            project.url
          }}</a>
          <div
            v-if="project.screenshots && project.screenshots.length > 0"
            class="screenshots"
          >
            <el-image
              v-for="(screenshot, idx) in project.screenshots"
              :key="idx"
              :src="screenshot"
              :preview-src-list="project.screenshots"
              :initial-index="idx"
              fit="contain"
              class="screenshot"
              preview-teleported
            />
          </div>
        </div>
      </div>

      <!-- 教育背景 -->
      <div class="resume-section">
        <h2>教育背景</h2>
        <div
          v-for="(edu, index) in resumeData.education"
          :key="index"
          class="education-info"
        >
          <div class="experience-header">
            <h3>{{ edu.school }}</h3>
          </div>
          <div class="education-info-body">
            <span class="period">{{ edu.period }}</span>
            <span class="major">{{ edu.major }}</span>
            <div v-if="isAuthenticated" class="verification">
              <a :href="edu.verificationUrl" target="_blank"
                >学信网验证码：{{ edu.verificationCode }}</a
              >
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 密码对话框 -->
    <el-dialog
      v-model="showPasswordDialog"
      title="请输入密码查看完整信息"
      width="30%"
    >
      <el-input
        v-model="password"
        type="password"
        placeholder="请输入密码"
        show-password
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPasswordDialog = false">取消</el-button>
          <el-button type="primary" @click="verifyPassword">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useResumeStore } from '../stores/resume';
import { useRoute, useRouter } from 'vue-router';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ElMessage } from 'element-plus';

const router = useRouter();
const route = useRoute();
const resumeStore = useResumeStore();
const resumeData = ref({});
const loading = ref(true);
const isAuthenticated = ref(false);
const showPasswordDialog = ref(false);
const password = ref('1234');

onMounted(async () => {
  try {
    const route = useRoute();
    const pwdFromUrl = route.query.pwd;

    if (pwdFromUrl) {
      password.value = pwdFromUrl;
      await resumeStore.fetchResumeData(pwdFromUrl);
    } else {
      await resumeStore.fetchResumeData();
    }

    resumeData.value = resumeStore.resumeData;
    isAuthenticated.value = resumeStore.isAuthenticated;
    loading.value = false;
    updateTitle();
  } catch (error) {
    ElMessage.error('获取简历数据失败');
    loading.value = false;
  }
});

const updateTitle = () => {
  document.title = `${
    resumeData.value.personalInfo?.name || '加载中...'
  }的个人简历`;
};

watch(isAuthenticated, () => {
  updateTitle();
});

const verifyPassword = async () => {
  try {
    await resumeStore.fetchResumeData(password.value);
    resumeData.value = resumeStore.resumeData;
    isAuthenticated.value = resumeStore.isAuthenticated;

    if (isAuthenticated.value) {
      ElMessage.success('验证成功，显示完整信息');
      showPasswordDialog.value = false;
    } else {
      ElMessage.error('密码错误');
    }
  } catch (error) {
    ElMessage.error('验证失败');
  }
};

const clearAuthentication = () => {
  resumeStore.clearAuthentication();
  isAuthenticated.value = false;
  // 重新获取脱敏数据
  resumeStore.fetchResumeData();
  resumeData.value = resumeStore.resumeData;
  ElMessage.success('已隐藏敏感信息');
};

const exportPDF = async () => {
  try {
    const element = document.querySelector('.resume-container');
    const privacySection = element.querySelector('.privacy-section');
    const originalDisplay = privacySection.style.display;
    privacySection.style.display = 'none';

    // 创建PDF文档，设置较小的边距
    const pdf = new jsPDF({
      unit: 'px',
      format: 'a4',
      orientation: 'portrait',
    });

    // 获取页面尺寸并设置较小的边距
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10; // 减小边距

    // 计算实际内容区域
    const contentWidth = pageWidth - 2 * margin;
    const contentHeight = pageHeight - 2 * margin;

    // 生成高质量的canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
    });

    // 获取canvas尺寸
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // 计算缩放比例，增加填充比例
    const scale = Math.min(
      (contentWidth / canvasWidth) * 1.3, // 增加30%的填充比例
      (contentHeight / canvasHeight) * 1.3
    );

    // 计算居中位置
    const x = margin;
    const y = margin;

    // 将canvas转换为图片
    const imgData = canvas.toDataURL('image/jpeg', 1.0);

    // 添加图片到PDF，使用计算后的位置和尺寸
    pdf.addImage(
      imgData,
      'JPEG',
      x,
      y,
      canvasWidth * scale,
      canvasHeight * scale
    );

    // 保存PDF
    pdf.save(`${resumeData.value.personalInfo?.name || '简历'}.pdf`);

    // 恢复隐藏的元素
    privacySection.style.display = originalDisplay;
    ElMessage.success('PDF导出成功');
  } catch (error) {
    console.error('PDF导出失败:', error);
    ElMessage.error('PDF导出失败');
  }
};
</script>

<style lang="scss" scoped>
// 基础布局
.resume-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  background-color: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

// 头部样式
.resume-header {
  text-align: center;
  margin-bottom: 20px;

  h1 {
    font-size: 28px;
    margin-bottom: 8px;
  }
}

// 个人信息样式
.personal-info {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 15px;
  margin: 10px 0;

  .info-item {
    width: calc(33.33% - 10px);
    display: flex;
    align-items: flex-start;
    text-align: left;

    .label {
      font-weight: bold;
      margin-right: 8px;
      white-space: nowrap;
    }

    &.clickable {
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        color: #409eff;
      }
    }

    .qr-code-thumbnail {
      width: 20px;
      height: 20px;
      margin-left: 4px;
      border-radius: 2px;
    }
  }
}

// 隐私部分样式
.privacy-section {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
  padding-top: 20px;
}

// 加载状态样式
.loading-container {
  padding: 20px;
}

// 简历内容区域样式
.resume-section {
  margin-bottom: 30px;

  h2 {
    font-size: 20px;
    border-bottom: 2px solid #409eff;
    padding-bottom: 8px;
    margin-bottom: 16px;
  }
}

// 自我评价样式
.self-evaluation {
  padding-left: 20px;

  li {
    margin-bottom: 8px;
    line-height: 1.6;
  }
}

// 经验项目通用样式
.experience-item {
  margin-bottom: 24px;

  .experience-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    h3 {
      font-size: 18px;
      margin: 0;
    }

    .period,
    .tech-stack {
      color: #606266;
      font-size: 14px;
    }
  }

  .description {
    margin-bottom: 12px;
    line-height: 1.6;
  }

  .responsibilities {
    padding-left: 20px;

    li {
      margin-bottom: 6px;
      line-height: 1.6;
    }
  }
}

// 教育信息样式
.education-info-body {
  span {
    margin-right: 20px;
  }
}

.personal-project-item {
  margin-bottom: 40px;
}

// 项目截图样式
.screenshots {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  flex-wrap: wrap;

  .screenshot {
    width: 120px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
    cursor: pointer;
    transition: transform 0.3s;

    &:hover {
      transform: scale(1.05);
    }
  }
}

// 二维码弹出层样式
.qr-code-popover {
  padding: 8px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

// 响应式布局
@media (max-width: 768px) {
  .resume-container {
    padding: 15px;

    .experience-header {
      flex-direction: column;
      align-items: flex-start;

      .period,
      .tech-stack {
        margin-top: 4px;
      }
    }

    .privacy-section {
      flex-direction: column;
      align-items: center;

      .el-button {
        width: 100%;
        margin-bottom: 10px;
      }
    }

    .personal-info {
      .info-item {
        width: 100%;
      }
    }
  }
}
.qr-code-popover {
  padding: 8px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
</style>
