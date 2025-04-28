/**
 * 隐私数据处理工具
 * 根据配置对数据进行掩码处理
 */

/**
 * 对数据进行隐私保护处理
 * @param {Object} data - 原始数据对象
 * @param {Boolean} isAuthenticated - 是否已认证
 * @param {Object} fieldsToMask - 需要掩码的字段配置，格式为 {section: [fields]}
 * @param {String} maskChar - 掩码字符，默认为 '*'
 * @returns {Object} - 处理后的数据
 */
function maskPrivateData(
  data,
  isAuthenticated,
  fieldsToMask = {},
  maskConfig = {}
) {
  // 如果已认证，直接返回原始数据
  if (isAuthenticated) {
    return data;
  }

  // 创建深拷贝以避免修改原始数据
  const maskedData = JSON.parse(JSON.stringify(data));

  // 遍历需要掩码的字段配置
  Object.entries(fieldsToMask).forEach(([section, fields]) => {
    if (maskedData[section]) {
      if (Array.isArray(maskedData[section])) {
        maskedData[section].forEach((item) => {
          fields.forEach((field) => {
            if (item[field] !== undefined) {
              // 使用自定义掩码文本或默认掩码
              if (maskConfig[field] && maskConfig[field].unauthenticated) {
                item[field] = maskConfig[field].unauthenticated;
              } else {
                item[field] = '*'.repeat(11);
              }
            }
          });
        });
      } else {
        fields.forEach((field) => {
          if (maskedData[section][field] !== undefined) {
            // 使用自定义掩码文本或默认掩码
            if (maskConfig[field] && maskConfig[field].unauthenticated) {
              maskedData[section][field] = maskConfig[field].unauthenticated;
            } else {
              maskedData[section][field] = '*'.repeat(11);
            }
          }
        });
      }
    }
  });

  return maskedData;
}

module.exports = {
  maskPrivateData,
};
