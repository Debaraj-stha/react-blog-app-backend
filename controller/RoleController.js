const { RoleAssignmentModel } = require("../models");
const ROLE_PERMISSIONS = {
  editor: {
    'UPDATE': true,
    'DELETE': false
  },
  author: {
    'UPDATE': true,
    'DELETE': true
  }
}
const checkPermission = async (user_id, blog_id, action) => {
  const roleEntry = await RoleAssignmentModel.findOne({ blog_id,user_id });
  if (!roleEntry) return false;
  const permissions = ROLE_PERMISSIONS[roleEntry.role];
  return permissions?.[action] || false;
};
module.exports=checkPermission
