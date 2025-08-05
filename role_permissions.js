const ROLE_PERMISSIONS = {
  author: {
    canEdit: true,
    canDelete: true,
    canView: true,
  },
  editor: {
    canEdit: true,
    canDelete: false,
    canView: true,
  },
};

module.exports =ROLE_PERMISSIONS