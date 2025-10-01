export function buildExtraFields(formState = {}, fields = []) {
    const extra = {};
    fields.forEach(f => {
      const val = formState[f.label];
      if (val !== undefined && val !== null && val !== '') {
        extra[f.key] = val;
      }
    });
    return extra;
  }
  
  // инициализация formState из поста (при редактировании)
  export function initFormStateFromPost(post = {}, fields = []) {
    const extra = post.extra_fields || {};
    const init = {};
    fields.forEach(f => {
      init[f.key] = extra.hasOwnProperty(f.key) ? extra[f.label] : null;
    });
    return init;
  }