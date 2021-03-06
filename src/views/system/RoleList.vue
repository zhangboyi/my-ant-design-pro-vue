<template>
  <a-card :bordered="false" class="card-area">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <!-- 搜索区域 -->
      <a-form layout="inline" :form="screenForm" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :md="6" :sm="8">
            <a-form-item label="角色名称" :labelCol="{span: 5}" :wrapperCol="{span: 18, offset: 1}">
              <a-input placeholder="请输入名称查询" v-decorator="['roleName',{}]"></a-input>
            </a-form-item>
          </a-col>
          <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
            <a-col :md="6" :sm="24">
              <a-button type="primary" icon="search" @click="searchQuery">查询</a-button>
              <a-button
                style="margin-left: 8px"
                type="primary"
                icon="reload"
                @click="searchReset"
              >重置</a-button>

              <a-button @click="handleAdd" type="primary" icon="plus" style="margin-left:10px">新增</a-button>
              <a-dropdown v-if="selectedRowKeys.length > 0">
                <a-menu slot="overlay">
                  <a-menu-item key="1" @click="batchDel">
                    <a-icon type="delete" />删除
                  </a-menu-item>
                </a-menu>
                <a-button style="margin-left: 8px">
                  批量操作
                  <a-icon type="down" />
                </a-button>
              </a-dropdown>
            </a-col>
          </span>
        </a-row>
      </a-form>
    </div>

    <!-- table区域-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择&nbsp;
        <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项&nbsp;&nbsp;
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>

      <a-table
        ref="table"
        size="middle"
        bordered
        rowKey="sysRoleId"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        @change="handleTableChange"
      >
        <span slot="state" slot-scope="text">
          <a-badge :status="text | stateTypeFilter" :text="text | stateFilter" />
        </span>

        <span slot="action" slot-scope="text, record">
          <a-button
            type="primary"
            icon="safety-certificate"
            @click="handlePerssion(record.sysRoleId)"
          >授权</a-button>&nbsp;&nbsp;
          <a-button
            type="primary"
            icon ="lock"
            v-if="record.state=== 0 "
            @click="handleState(record.sysRoleId,'1')"
          >停用</a-button>
          <a-button
            type="primary"
            icon ="unlock"
            v-if="record.state=== 1  "
            @click="handleState(record.sysRoleId,'0')"
          >启用</a-button>&nbsp;&nbsp;
          <a-button @click="handleEdit(record)">编辑</a-button>&nbsp;&nbsp;
          <a-button @click="handleDelete(record.sysRoleId)">删除</a-button>
        </span>
      </a-table>
    </div>
    <!-- table区域-end -->

    <!-- 表单区域 -->
    <role-modal ref="modalForm" @ok="modalFormOk"></role-modal>
    <user-role-modal ref="modalUserRole"></user-role-modal>
  </a-card>
</template>

<script>
import RoleModal from './modules/RoleModal'
import UserRoleModal from './modules/UserRoleModal'
import Vue from 'vue'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { filterObj } from '@/utils/util'
import { rolePage, deleteByRoleId,edit, deleteBatch } from '@/api/role'
const columns = [
  {
    title: '#',
    dataIndex: '',
    key: 'rowIndex',
    width: 60,
    align: 'center',
    customRender: function(t, r, index) {
      return parseInt(index) + 1
    }
  },
  {
    title: '角色名称',
    align: 'center',
    dataIndex: 'roleName',
    width: 200
  },
  {
    title: '角色编码',
    align: 'center',
    dataIndex: 'roleCode',
    width: 200
  },
  {
    title: '状态',
    align: 'center',
    dataIndex: 'state',
    scopedSlots: { customRender: 'state' },
    width: 120
  },
  {
    title: '序号',
    dataIndex: 'sort',
    align: 'center',
    width: 120
  },
  {
    title: '备注',
    align: 'center',
    dataIndex: 'remark'
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    align: 'center',
    width: 200
  },
  {
    title: '操作',
    dataIndex: 'action',
    align: 'center',
    scopedSlots: { customRender: 'action' },
    width: 360
  }
]

const stateMap = {
  '0': {
    state: 'success',
    text: '启用'
  },
  '1': {
    state: 'warning',
    text: '停用'
  }
}
export default {
  name: 'RoleList_view',
  components: {
    RoleModal,
    UserRoleModal
  },

  data() {
    return {
      dataSource: [],
      loading: false,
      screenForm: this.$form.createForm(this),
      selectedRowKeys: [],
      columns: columns,
      ipagination: {
        current: 1,
        pageSize: 10,
        pageSizeOptions: ['10', '20', '30'],
        showTotal: (total, range) => {
          return range[0] + '-' + range[1] + ' 共' + total + '条'
        },
        showQuickJumper: true,
        showSizeChanger: true,
        total: 0
      }
    }
  },
  filters: {
    stateFilter(type) {
      return stateMap[type].text
    },
    stateTypeFilter(type) {
      return stateMap[type].state
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData(screenData) {
      let that = this
      let obj = {
        current: that.ipagination.current,
        size: that.ipagination.pageSize,
        ...screenData
      }
      this.loading = true
      await rolePage(obj).then(res => {
        if (res.code === 200) {
          this.dataSource = res.data
          that.ipagination.total = res.page.total
        }
        this.loading = false
      })
    },
    // 表单查询
    searchQuery(e) {
      e.preventDefault()
      this.ipagination.current = 1
      let { ...others } = this.screenForm.getFieldsValue()
      this.loadData({
        ...others
      })
    },
    // 表单重置
    searchReset() {
      this.screenForm.resetFields()
      this.ipagination.current = 1
      this.loadData()
    },
    // 新增
    handleAdd: function() {
      this.$refs.modalForm.add()
      this.$refs.modalForm.title = '新增'
      this.$refs.modalForm.disableSubmit = false
    },
    // 取消选中
    onClearSelected() {
      this.selectedRowKeys = []
      this.selectionRows = []
    },
    onSelectChange(selectedRowKeys, selectionRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectionRows = selectionRows
    },
    //分页、排序、筛选变化时触发
    handleTableChange(pagination, filters, sorter) {
      if (Object.keys(sorter).length > 0) {
        this.isorter.column = sorter.field
        this.isorter.order = 'ascend' == sorter.order ? 'asc' : 'desc'
      }
      this.ipagination = pagination
      this.loadData()
    },
    // 新增/修改 成功时，重载列表
    modalFormOk() {
      this.loadData()
    },
    // 编辑
    handleEdit: function(record) {
      this.$refs.modalForm.edit(record)
      this.$refs.modalForm.title = '编辑'
      this.$refs.modalForm.disableSubmit = false
    },
    // 删除
    handleDelete: function(id) {
      var that = this
      that.$confirm({
        title: '确认删除',
        content: '是否删除当前数据?',
        onOk: function() {
          deleteByRoleId({ sysRoleId: id }).then(res => {
            if (res.code === 200) {
              that.$message.success('操作成功!')
              that.loadData()
            } else {
              that.$message.warning(res.msg || '操作失败!')
            }
          })
        }
      })
    },
    // 批量删除
    batchDel: function() {
      if (this.selectedRowKeys.length <= 0) {
        this.$message.warning('请选择一条记录！')
        return
      } else {
        var ids = ''
        for (var a = 0; a < this.selectedRowKeys.length; a++) {
          ids += this.selectedRowKeys[a] + ','
        }
        var that = this
        this.$confirm({
          title: '确认删除',
          content: '是否删除选中数据?',
          onOk: function() {
            deleteBatch({ ids: ids }).then(res => {
              if (res.code === 200) {
                that.$message.success('操作成功!')
                that.loadData()
                that.onClearSelected()
              } else {
                that.$message.warning(res.msg || '操作失败!')
              }
            })
          }
        })
      }
    },
    // 授权
    handlePerssion: function(roleId) {
      this.$refs.modalUserRole.show(roleId)
    },
     // 启用停用
    handleState(sysRoleId, state) {
      let msg = '启用'
      if (state === '1') {
        msg = '停用'
      }
      let _this = this
      _this.$confirm({
        title: '提示',
        content: '您确定要' + msg + '该角色吗?',
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        async onOk() {
          let obj = {
            sysRoleId,
            state
          }
          edit(obj).then(resp => {
            if (resp.code === 200) {
              _this.$message.success('操作成功!')
              _this.loadData()
            } else {
              _this.$message.error(resp.msg || '操作失败!')
            }
          })
        },
        onCancel() {}
      })
    },
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>