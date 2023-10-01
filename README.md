# se-invigilation-vue

### 
实现了抽象的设计  
在响应拦截器添加递归过滤函数，将属性中MySQL JSON字段返回的字符串直接序列化为JS对象，避免了在业务逻辑手动转换。  
设计slot实现数据相似但部分实现功能不同的表格的渲染。  

实现带关闭回调的全局通用确认框

**设计思想**  
视图组件设计为阻塞组件，加载后调用业务组件获取数据并阻塞等待；  
业务组件基于需求从本地store缓存/远程加载数据，数据加载后置于store缓存或直接返回视图组件；  

同步组件设计更直观简洁，避免了原设计中大量使用响应应式数据/store响应式数据/监听回调等。  



