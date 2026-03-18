/**
 * ============================================================================
 * 파일 업로드 클라이언트 (Task #14)
 * ============================================================================
 * 클라이언트 측 파일 업로드 관리
 * - 드래그 앤 드롭 지원
 * - 진행률 추적
 * - 여러 파일 일괄 업로드
 * - 파일 미리보기
 * 작성: Charlie 분대
 * 날짜: 2026-03-19
 * ============================================================================
 */

class MediaUploader {
  /**
   * 생성자
   * @param {Object} options - 설정 옵션
   * @param {string} options.apiEndpoint - API 엔드포인트 (기본값: /api/media)
   * @param {number} options.maxFileSize - 최대 파일 크기 (바이트, 기본값: 50MB)
   * @param {Array<string>} options.allowedMimeTypes - 허용 MIME 타입
   * @param {Function} options.onProgress - 진행률 콜백
   * @param {Function} options.onComplete - 완료 콜백
   * @param {Function} options.onError - 에러 콜백
   */
  constructor(options = {}) {
    this.apiEndpoint = options.apiEndpoint || '/api/media';
    this.maxFileSize = options.maxFileSize || 50 * 1024 * 1024;  // 50MB
    this.allowedMimeTypes = options.allowedMimeTypes || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'video/mp4',
      'video/webm',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    this.onProgress = options.onProgress || (() => {});
    this.onComplete = options.onComplete || (() => {});
    this.onError = options.onError || (() => {});
    this.token = options.token || localStorage.getItem('authToken');
  }

  /**
   * 파일 유효성 검사
   * @param {File} file - 검사할 파일
   * @returns {Object} { valid: boolean, error?: string }
   */
  validateFile(file) {
    // MIME 타입 검사
    if (!this.allowedMimeTypes.includes(file.type)) {
      return {
        valid: false,
        error: `파일 형식 "${file.type}"은 지원되지 않습니다. 허용된 형식: ${this.allowedMimeTypes.join(', ')}`,
      };
    }

    // 파일 크기 검사
    if (file.size > this.maxFileSize) {
      return {
        valid: false,
        error: `파일 크기가 ${this.formatFileSize(this.maxFileSize)}를 초과합니다. 파일 크기: ${this.formatFileSize(file.size)}`,
      };
    }

    return { valid: true };
  }

  /**
   * 파일 크기를 읽기 쉬운 형식으로 변환
   * @param {number} bytes - 바이트 단위의 크기
   * @returns {string} 형식화된 크기 (예: "2.5 MB")
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * 단일 파일 업로드
   * @param {File} file - 업로드할 파일
   * @param {number} candidateId - 후보자 ID
   * @param {Object} options - 추가 옵션
   * @returns {Promise<Object>} 업로드 결과
   */
  async uploadFile(file, candidateId, options = {}) {
    // 파일 유효성 검사
    const validation = this.validateFile(file);
    if (!validation.valid) {
      this.onError(validation.error);
      throw new Error(validation.error);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('candidate_id', candidateId);
    formData.append('is_public', options.isPublic !== false);

    if (options.description) {
      formData.append('description', options.description);
    }

    try {
      const response = await fetch(`${this.apiEndpoint}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      this.onProgress({ fileName: file.name, progress: 100 });
      this.onComplete(result.data);
      return result.data;
    } catch (error) {
      this.onError(error.message);
      throw error;
    }
  }

  /**
   * 여러 파일 일괄 업로드
   * @param {FileList|Array<File>} files - 업로드할 파일들
   * @param {number} candidateId - 후보자 ID
   * @param {Object} options - 추가 옵션
   * @returns {Promise<Array<Object>>} 업로드 결과 배열
   */
  async uploadMultiple(files, candidateId, options = {}) {
    const fileArray = Array.from(files);
    const results = [];

    // 파일 유효성 검사
    const invalidFiles = fileArray.filter(f => !this.validateFile(f).valid);
    if (invalidFiles.length > 0) {
      const errors = invalidFiles
        .map(f => `${f.name}: ${this.validateFile(f).error}`)
        .join('\n');
      this.onError(errors);
      throw new Error(`일부 파일이 유효하지 않습니다:\n${errors}`);
    }

    // 파일 10개 제한
    if (fileArray.length > 10) {
      throw new Error('한 번에 최대 10개의 파일만 업로드할 수 있습니다.');
    }

    const formData = new FormData();
    fileArray.forEach(file => {
      formData.append('files', file);
    });
    formData.append('candidate_id', candidateId);
    formData.append('is_public', options.isPublic !== false);

    try {
      const response = await fetch(`${this.apiEndpoint}/bulk-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Bulk upload failed');
      }

      const result = await response.json();
      this.onComplete(result.data);
      return result.data.files || [];
    } catch (error) {
      this.onError(error.message);
      throw error;
    }
  }

  /**
   * 파일 미리보기 생성
   * @param {File} file - 미리보기할 파일
   * @returns {Promise<string|null>} 데이터 URL 또는 null
   */
  async generatePreview(file) {
    return new Promise((resolve) => {
      // 이미지 파일
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      }
      // PDF 파일 (썸네일은 별도 라이브러리 필요)
      else if (file.type === 'application/pdf') {
        resolve(null);  // PDF 미리보기는 별도 처리 필요
      }
      // 비디오 파일
      else if (file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const video = document.createElement('video');
          video.src = e.target.result;
          video.onloadedmetadata = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            resolve(canvas.toDataURL());
          };
        };
        reader.readAsDataURL(file);
      }
      // 기타 파일
      else {
        resolve(null);
      }
    });
  }

  /**
   * 후보자의 미디어 목록 조회
   * @param {number} candidateId - 후보자 ID
   * @param {Object} options - 조회 옵션 (limit, offset, mime_type)
   * @returns {Promise<Array<Object>>} 미디어 목록
   */
  async getMediaList(candidateId, options = {}) {
    const params = new URLSearchParams({
      limit: options.limit || 50,
      offset: options.offset || 0,
      ...(options.mimeType && { mime_type: options.mimeType }),
    });

    try {
      const response = await fetch(`${this.apiEndpoint}/candidate/${candidateId}/list?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': this.token ? `Bearer ${this.token}` : undefined,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve media list');
      }

      const result = await response.json();
      return result.data.media || [];
    } catch (error) {
      this.onError(error.message);
      throw error;
    }
  }

  /**
   * 파일 삭제
   * @param {number} fileId - 파일 ID
   * @returns {Promise<void>}
   */
  async deleteFile(fileId) {
    try {
      const response = await fetch(`${this.apiEndpoint}/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Delete failed');
      }

      this.onComplete({ id: fileId, deleted: true });
    } catch (error) {
      this.onError(error.message);
      throw error;
    }
  }

  /**
   * 드래그 앤 드롭 영역 초기화
   * @param {HTMLElement} element - 드롭 영역 요소
   * @param {number} candidateId - 후보자 ID
   * @param {Function} onDrop - 드롭 완료 콜백
   */
  initializeDragDrop(element, candidateId, onDrop = () => {}) {
    element.addEventListener('dragover', (e) => {
      e.preventDefault();
      element.classList.add('drag-over');
    });

    element.addEventListener('dragleave', () => {
      element.classList.remove('drag-over');
    });

    element.addEventListener('drop', async (e) => {
      e.preventDefault();
      element.classList.remove('drag-over');

      const files = e.dataTransfer.files;
      try {
        const results = await this.uploadMultiple(files, candidateId);
        onDrop(results);
      } catch (error) {
        console.error('Drag and drop upload failed:', error);
      }
    });
  }
}

/**
 * ============================================================================
 * HTML5 파일 입력 통합
 * ============================================================================
 */

// 사용 예시:
/*
const uploader = new MediaUploader({
  apiEndpoint: '/api/media',
  maxFileSize: 50 * 1024 * 1024,
  onProgress: (data) => {
    console.log(`Uploading ${data.fileName}: ${data.progress}%`);
  },
  onComplete: (data) => {
    console.log('Upload completed:', data);
  },
  onError: (error) => {
    console.error('Upload error:', error);
  },
});

// 단일 파일 업로드
document.getElementById('fileInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    await uploader.uploadFile(file, 1);  // candidateId = 1
  }
});

// 드래그 앤 드롭
uploader.initializeDragDrop(
  document.getElementById('dropZone'),
  1,  // candidateId = 1
  (results) => {
    console.log('Files dropped and uploaded:', results);
  }
);
*/

// 모듈 내보내기 (ES6)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MediaUploader;
}
