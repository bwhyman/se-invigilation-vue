# se-invigilation-vue

### Update
#### 2023.12.20
封装函数式成功消息组件。错误/异常信息设计为必须手动关闭模态框。成功等信息设计为不再需要点击确认的右上角浮动消息提示框，减少操作步骤。  

#### 2023.12.18
创建函数式组件。当循环渲染多数据状态组件，例如图标按钮，组件有需传递数据并打开相同对话框操作。
如果按声明式创建组件，需在组件内引入对话框，但在循环渲染组件时无需反复创建相同对话框对象。
因此，将对话框组件通过渲染函数创建并挂载到body节点，通过函数使组件与通用对话框组件解耦。  
全局消息模态框按函数式组件重构。  

#### 2023.12.17
添加监考分配排除规则。在监考分配时将符合排除规则教师置于冲突列表。  
说明：可以使用快捷选项迅速设置数据，也可单独选择具体数据。例如直接选择星期或节。  
规则：相同起止周/星期/节为一个规则。例如教师工作日早晚排除；但该教师周末全天也需排除，则需创建一个新规则。  
监考分配时，改变字体提示具体的冲突因素。  

#### 2023.12.12
在专业功能下添加倒序显示的次数统计功能。其实在任意监考里均可查看次数。   
专业备注，非系统强制性的监考限制说明，描述信息在监考分配视图显示以提示监考分配负责人。记录例如，王明老师周一12节送孩子不分配监考；李强老师周末不分配监考等。   
可以像课表一样基于模板批量导入并由系统实现判断。  

#### 2023.12.08
指定时间检索监考处理中，将剪裁的相同时间/地点的监考，聚合为一个监考后导出为表格。  

#### 2023.12.06
为耗时请求组件添加全屏loading遮罩，提醒用户操作在进行中。  
阻止重复发送监考通知。发送通知后，不点击反馈信息模态框而刷新页面则仍会停留在当前通知页面，并可在页面重复发送通知。通过判断监考通知信息的钉钉通知编码解决。     
优化全局警告框。  

#### 2023.11.16
手动检索教师分配监考。   
分离功能组件的视图与逻辑，循环渲染组件时仅需创建视图对象。减少组件内存占用。  

#### 2023.11.14
将钉钉日程提醒时间修改为监考前一天早8点+2小时。避免原24小时提醒时第二天晚上的监考，教师关闭钉钉无法提前一天收到钉钉提醒。  
由第一位监考教师创建钉钉日程，避免原由专业负责人创建日程时收到不必要的监考日程提醒。但第一监考教师没有`钉钉日程确认`提醒。    
剪裁。从当前监考剪裁出一个新监考，监考教师跨专业授课时，便于学院直接分配。   
将过多功能以图标平铺显示在组件视图，致使视图显示越发杂乱。基于逻辑简化整合至二级下拉菜单。  
统一常用监考数据显示格式。    

#### 2023.11.08
重新实现平滑滚动回顶部。  

#### 2023.11.07
路由参数监听bug，改为watchEffect()函数实现。watch()函数在开发环境下可以直接监听props对象，但编译后在生产环境下竟然无效，相似操作在另一组件却有效，需要好好测试一下。  

#### 2023.11.03
添加导出指定时间段监考表格，优化表格样式。  
按功能拆分excel操作模块。  

#### 2023.12.02
添加向同一课程监考教师统一发送钉钉工作消息，例如高数的大厅取卷/将试卷送到指定教室等。   
重组部分接口，增强了接口扩展性/安全性/弹性。  

#### 2023.10.30
优化组件渲染速度，大工具类文件在函数执行而非组件加载时加载。  
优化监考分配数据，整合到一次循环实现，但逻辑是否清晰？代码是否过于复杂不利于维护？  
重新分配时，将原分配单列并置顶，使信息更清晰。  
优化表格显示效果。  
修复检索时date-picker组件时间类型bug。默认Date转ISO有+8时差，总忘。还是转为使用字符串类型方便。  
修复栅格在小屏幕下视图组件CSS叠加覆盖bug。   
修复已下发未分配中包含未下发数据bug。  


#### 2023.10.17
添加免密登录。  
免密入口文本描述调用随机诗词接口，活跃一下疲劳的工作气氛。  
悬浮在监考各过程操作人员姓名时显示操作时间。   
监考重新分配时，按原分配默认选中。  
导入需下发状态监考比较重要，单独取消分页。  
添加`处理`模块，基于重要监考信息操作。支持按日期(默认7日)检索/按状态过滤/按专业分组，便于掌握监考下发分配情况。  
修复课表读取单周时仅基于长度判断的bug。   
优化课表表格读取；将复杂的正则表达式匹配替换为按数组分割。   
JS toLocaleString()函数，不同浏览器有不同实现，firefox使用本地语言中文`下午`描述。  

#### 2023.10.15
一个破课表也能弄出N个版本的格式

### Others
实现了抽象的设计  
在响应拦截器添加递归过滤函数，将属性中MySQL JSON字段返回的字符串直接序列化为JS对象，避免了在业务逻辑手动转换。  
设计slot实现数据相似但部分实现功能不同的表格的渲染。  

实现带关闭回调的全局通用确认框。


### Thinking
**打包拆分**  
按Java的编程习惯，一类相关操作会封装到一个工具类/组件中，但是后端仅有编译，不涉及到打包的文件拆分。  
前端项目默认以模块(文件)为单位打包，但是当编写了一个较大的工具模块时，引用的组件模块会加载整个工具模块，
而非在打包时将模块需要的工具函数分割。即，即时仅需使用工具模块中的一个函数，也需要加载整个模块，从而影响渲染速度。  

即，以粗粒度的功能分类模块是否利于打包部署？以细粒度的操作函数的分类又会产生大量文件，是否利于维护？  
打包时，是否能自动分割函数为独立模块文件打包？


**设计思想**  
视图组件设计为阻塞组件，加载后调用业务组件获取数据并阻塞等待；  
业务组件基于需求从本地store缓存/远程加载数据，数据加载后置于store缓存或直接返回视图组件；  

同步组件设计更直观简洁，避免了原设计中大量使用响应应式数据/store响应式数据/监听回调等。  

**store应该缓存什么数据的纠结**  
多次发生更新后数据不变，刷新就没问题了，发现是大量使用缓存导致的。  

一个组件需要从网络拉取一组数据渲染；切换到别的组件再切回来，当然不希望再从网络拉取，所以组件加载时先去store找，没有再网络请求，放store。优点，减少网络请求，提高效率。

但这些数据可能会被更新，比如加了一条，则需要从数据库重新拉取，要不没主键，需清空store否则组件加载还使用store中旧数据；还有，修改元素数据状态等等，可能都需要清store，不清在逻辑中修改store数据更麻烦。这样对一些数据修改的业务逻辑就非常非常不利于维护，总要想着是否影响了缓存数据并更新。

那这组数据是否应置于store缓存？如何平衡效率与可维护性？  

除非涉及大量IO操作，否则网络带宽/CPU运算频率/内存/磁盘容量等等都可以靠堆硬件解决，还是觉得项目的可维护性应大于网络请求效率。



