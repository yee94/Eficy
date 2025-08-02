import { signal, computed, asyncSignal } from 'eficy';
import { Form, Radio, Input } from 'antd';

// 模拟商品数据
const mockProducts = [
  {
    id: 1,
    name: 'iPhone 15 Pro',
    category: '手机数码',
    price: 8999,
    stock: 50,
    status: 'active',
    description: '最新款苹果手机，搭载 A17 Pro 芯片',
  },
  {
    id: 2,
    name: 'MacBook Air M2',
    category: '电脑办公',
    price: 9999,
    stock: 30,
    status: 'active',
    description: '轻薄便携的笔记本电脑',
  },
  {
    id: 3,
    name: 'AirPods Pro',
    category: '手机数码',
    price: 1999,
    stock: 100,
    status: 'active',
    description: '主动降噪无线耳机',
  },
  {
    id: 4,
    name: 'iPad Air',
    category: '平板电脑',
    price: 4799,
    stock: 25,
    status: 'inactive',
    description: '轻薄高性能平板电脑',
  },
  {
    id: 5,
    name: 'Apple Watch Series 9',
    category: '智能穿戴',
    price: 3299,
    stock: 40,
    status: 'active',
    description: '健康监测智能手表',
  },
];

// 响应式状态管理
const searchKeyword = signal('');
const selectedCategory = signal('all');
const currentPage = signal(1);
const pageSize = signal(10);

// 弹窗状态
const modalVisible = signal(false);
const modalTitle = signal('添加商品');
const editingProduct = signal(null);
const formData = signal({
  name: '',
  category: '',
  price: '',
  stock: '',
  status: 'active',
  description: '',
});

// 异步加载商品数据
const { loading, data, error } = asyncSignal(async () => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return mockProducts;
});

// 操作函数
const handleSearch = (value) => {
  searchKeyword(value);
  currentPage(1); // 重置到第一页
};

const handleCategoryChange = (category) => {
  selectedCategory(category);
  currentPage(1); // 重置到第一页
};

const handlePageChange = (page) => {
  currentPage(page);
};

const handleEdit = (product) => {
  modalTitle('编辑商品');
  editingProduct(product);
  formData({
    name: product.name,
    category: product.category,
    price: product.price.toString(),
    stock: product.stock.toString(),
    status: product.status,
    description: product.description,
  });
  modalVisible(true);
};

const handleAdd = () => {
  modalTitle('添加商品');
  editingProduct(null);
  formData({
    name: '',
    category: '',
    price: '',
    stock: '',
    status: 'active',
    description: '',
  });
  modalVisible(true);
};

const handleDelete = (product) => {
  e-Modal.confirm({
    title: '确认删除',
    content: `确定要删除商品"${product.name}"吗？`,
    onOk: () => {
      console.log('删除商品:', product);
      // 这里可以调用 API 删除商品
    },
  });
};

const handleStatusToggle = (product) => {
  console.log('切换商品状态:', product);
  // 这里可以调用 API 更新状态
};

const handleModalOk = () => {
  const { name, category, price, stock, status, description } = formData();
  
  if (!name || !category || !price || !stock || !description) {
    e-message.error('请填写完整信息');
    return;
  }

  const productData = {
    name,
    category,
    price: parseFloat(price),
    stock: parseInt(stock),
    status,
    description,
  };

  if (editingProduct()) {
    // 编辑模式
    console.log('更新商品:', { ...editingProduct(), ...productData });
  } else {
    // 添加模式
    console.log('添加商品:', { id: Date.now(), ...productData });
  }

  modalVisible(false);
  e-message.success(editingProduct() ? '商品更新成功' : '商品添加成功');
};

const handleModalCancel = () => {
  modalVisible(false);
};

const handleFormChange = (field, value) => {
  formData({ ...formData(), [field]: value });
};

export default () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">商品管理</h1>
        <p className="text-gray-600">管理系统中的所有商品信息</p>
      </div>

      {/* 搜索和筛选栏 */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* 搜索框 */}
          <div className="flex-1 min-w-64">
            <e-Input
              placeholder="搜索商品名称或描述"
              value={searchKeyword}
              onChange={(e) => handleSearch(e.target.value)}
              onSearch={handleSearch}
              className="w-full"
            />
          </div>

          {/* 分类筛选 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">分类：</span>
            <e-Select
              value={selectedCategory}
              onChange={handleCategoryChange}
              style={{ width: 150 }}
              options={computed(() => {
                const products = data() || [];
                const categorySet = new Set(products.map((p) => p.category));
                return ['all', ...Array.from(categorySet)].map((category) => ({
                  label: category === 'all' ? '全部分类' : category,
                  value: category,
                }));
              })}
            />
          </div>

          {/* 添加商品按钮 */}
          <e-Button type="primary" icon={<e-PlusOutlined />} onClick={handleAdd}>
            添加商品
          </e-Button>
        </div>
      </div>

      {/* 商品表格 */}
      <div className="bg-white rounded-lg shadow-sm">
        {computed(() =>
          error() ? (
            <div className="p-8 text-center">
              <e-Result status="error" title="加载失败" subTitle="商品数据加载失败，请稍后重试" />
            </div>
          ) : (
            <e-Table
              loading={loading}
              dataSource={computed(() => {
                const products = data() || [];
                const keyword = searchKeyword().toLowerCase();
                const category = selectedCategory();
                const page = currentPage();
                const size = pageSize();

                // 过滤商品
                const filtered = products.filter((product) => {
                  const matchesKeyword =
                    product.name.toLowerCase().includes(keyword) || product.description.toLowerCase().includes(keyword);
                  const matchesCategory = category === 'all' || product.category === category;
                  return matchesKeyword && matchesCategory;
                });

                // 分页
                const start = (page - 1) * size;
                const end = start + size;
                return filtered.slice(start, end);
              })}
              columns={[
                {
                  title: '商品信息',
                  key: 'product',
                  render: (_, record) => (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <e-ShoppingOutlined className="text-gray-400" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 cursor-pointer hover:text-blue-600" onClick={() => handleEdit(record)}>
                          {record.name}
                        </div>
                        <div className="text-sm text-gray-500">{record.description}</div>
                      </div>
                    </div>
                  ),
                },
                {
                  title: '分类',
                  dataIndex: 'category',
                  key: 'category',
                  render: (category) => <e-Tag color="blue">{category}</e-Tag>,
                },
                {
                  title: '价格',
                  dataIndex: 'price',
                  key: 'price',
                  render: (price) => <span className="font-semibold text-red-600">¥{price.toLocaleString()}</span>,
                },
                {
                  title: '库存',
                  dataIndex: 'stock',
                  key: 'stock',
                  render: (stock) => (
                    <span className={stock > 20 ? 'text-green-600' : 'text-orange-600'}>{stock} 件</span>
                  ),
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => (
                    <e-Tag color={status === 'active' ? 'green' : 'red'}>{status === 'active' ? '上架' : '下架'}</e-Tag>
                  ),
                },
                {
                  title: '操作',
                  key: 'actions',
                  render: (_, record) => (
                    <div className="flex gap-2">
                      <e-Button size="small" type="link" onClick={() => handleEdit(record)}>
                        编辑
                      </e-Button>
                      <e-Button size="small" type="link" onClick={() => handleStatusToggle(record)}>
                        {record.status === 'active' ? '下架' : '上架'}
                      </e-Button>
                      <e-Button size="small" type="link" danger onClick={() => handleDelete(record)}>
                        删除
                      </e-Button>
                    </div>
                  ),
                },
              ]}
              pagination={computed(() => {
                const products = data() || [];
                const keyword = searchKeyword().toLowerCase();
                const category = selectedCategory();

                // 计算过滤后的总数
                const filtered = products.filter((product) => {
                  const matchesKeyword =
                    product.name.toLowerCase().includes(keyword) || product.description.toLowerCase().includes(keyword);
                  const matchesCategory = category === 'all' || product.category === category;
                  return matchesKeyword && matchesCategory;
                });

                return {
                  current: currentPage(),
                  pageSize: pageSize(),
                  total: filtered.length,
                  onChange: handlePageChange,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条商品`,
                };
              })}
              rowKey="id"
            />
          ),
        )}
      </div>

      {/* 统计信息 */}
      <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {computed(() => {
            const products = data() || [];
            const keyword = searchKeyword().toLowerCase();
            const category = selectedCategory();

            // 过滤后的商品列表
            const filtered = products.filter((product) => {
              const matchesKeyword =
                product.name.toLowerCase().includes(keyword) || product.description.toLowerCase().includes(keyword);
              const matchesCategory = category === 'all' || product.category === category;
              return matchesKeyword && matchesCategory;
            });

            const activeCount = filtered.filter((p) => p.status === 'active').length;
            const lowStockCount = filtered.filter((p) => p.stock < 20).length;
            const totalValue = filtered.reduce((sum, p) => sum + p.price * p.stock, 0);

            return [
              <div key="total" className="text-center">
                <div className="text-2xl font-bold text-blue-600">{filtered.length}</div>
                <div className="text-sm text-gray-600">商品总数</div>
              </div>,
              <div key="active" className="text-center">
                <div className="text-2xl font-bold text-green-600">{activeCount}</div>
                <div className="text-sm text-gray-600">上架商品</div>
              </div>,
              <div key="lowStock" className="text-center">
                <div className="text-2xl font-bold text-orange-600">{lowStockCount}</div>
                <div className="text-sm text-gray-600">库存不足</div>
              </div>,
              <div key="value" className="text-center">
                <div className="text-2xl font-bold text-purple-600">¥{totalValue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">库存总值</div>
              </div>,
            ];
          })}
        </div>
      </div>

      {/* 商品编辑弹窗 */}
      <e-Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        destroyOnClose
      >
        <Form layout="vertical" className="mt-4">
          <Form.Item label="商品名称" required>
            <e-Input
              placeholder="请输入商品名称"
            />
          </Form.Item>
          
          <Form.Item label="商品分类" required>
            <e-Select
              placeholder="请选择商品分类"
              options={[
                { label: '手机数码', value: '手机数码' },
                { label: '电脑办公', value: '电脑办公' },
                { label: '平板电脑', value: '平板电脑' },
                { label: '智能穿戴', value: '智能穿戴' },
                { label: '家用电器', value: '家用电器' },
                { label: '服装鞋帽', value: '服装鞋帽' },
              ]}
            />
          </Form.Item>
          
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="商品价格" required>
              <e-InputNumber
                placeholder="请输入价格"
                min={0}
                precision={2}
                prefix="¥"
                className="w-full"
              />
            </Form.Item>
            
            <Form.Item label="库存数量" required>
              <e-InputNumber
                placeholder="请输入库存"
                min={0}
                precision={0}
                className="w-full"
              />
            </Form.Item>
          </div>
          
          <Form.Item label="商品状态">
            <Radio.Group
            >
              <Radio value="active">上架</Radio>
              <Radio value="inactive">下架</Radio>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item label="商品描述" required>
            <Input.TextArea
              placeholder="请输入商品描述"
              rows={4}
            />
          </Form.Item>
        </Form>
      </e-Modal>
    </div>
  );
};
