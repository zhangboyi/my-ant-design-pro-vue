import { get,post,deleteAction,put} from '@/api/manage'

// =========  部门管理API  =========
// 加载部门树
const departTree = (params)=>get("/sysDept/departTree",params)
// 查询子级部门
const childrenDept = (params)=>get("/sysDept/childrenDept",params)
// 编辑
const editByDeptId = (params)=>put("/sysDept/edit",params)
// 部门添加
const addDept = (params)=>post("/sysDept/add",params)
// 删除
const deleteByDepartId  = (params)=>deleteAction("/sysDept/delete",params)
// 批量删除
const deleteBatch  = (params)=>deleteAction("/sysDept/deleteBatch",params)


export {
    departTree,
    childrenDept,
    deleteByDepartId,
    editByDeptId,
    addDept,
    deleteBatch
}

