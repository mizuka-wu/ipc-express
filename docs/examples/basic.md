# 基础示例

## 完整的 Todo 应用示例

这个示例展示了如何使用 ipc-express 构建一个简单的 Todo 应用。

### 主进程代码

```typescript
// main.ts
import { app, BrowserWindow, ipcMain } from 'electron';
import express from 'express';
import { IpcServer } from '@mizuka-wu/ipc-express';
import path from 'path';

const expressApp = express();
const ipcServer = new IpcServer(ipcMain);

// 模拟数据存储
let todos: Array<{ id: number; title: string; completed: boolean }> = [
  { id: 1, title: 'Learn Electron', completed: false },
  { id: 2, title: 'Learn ipc-express', completed: false },
];

// 中间件
expressApp.use(express.json());

// 日志中间件
expressApp.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API 路由

// 获取所有 Todo
expressApp.get('/api/todos', (req, res) => {
  res.send(todos);
});

// 获取单个 Todo
expressApp.get('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);
  
  if (!todo) {
    return res.status(404).send({ error: 'Todo not found' });
  }
  
  res.send(todo);
});

// 创建 Todo
expressApp.post('/api/todos', (req, res) => {
  const { title } = req.body;
  
  if (!title) {
    return res.status(400).send({ error: 'Title is required' });
  }
  
  const newTodo = {
    id: Math.max(...todos.map(t => t.id), 0) + 1,
    title,
    completed: false,
  };
  
  todos.push(newTodo);
  res.status(201).send(newTodo);
});

// 更新 Todo
expressApp.patch('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);
  
  if (!todo) {
    return res.status(404).send({ error: 'Todo not found' });
  }
  
  if (req.body.title !== undefined) {
    todo.title = req.body.title;
  }
  if (req.body.completed !== undefined) {
    todo.completed = req.body.completed;
  }
  
  res.send(todo);
});

// 删除 Todo
expressApp.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = todos.findIndex(t => t.id === id);
  
  if (index === -1) {
    return res.status(404).send({ error: 'Todo not found' });
  }
  
  const deleted = todos.splice(index, 1);
  res.send(deleted[0]);
});

// 启动 IPC 服务
ipcServer.listen(expressApp);

// 创建窗口
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile('index.html');
}

app.on('ready', createWindow);

app.on('before-quit', () => {
  ipcServer.removeAllListeners();
});
```

### 渲染进程代码

```typescript
// renderer.ts
import { ipcRenderer } from 'electron';
import { IpcClient } from '@mizuka-wu/ipc-express';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

const client = new IpcClient(ipcRenderer);

// 获取所有 Todo
async function loadTodos() {
  try {
    const response = await client.get<Todo[]>('/api/todos');
    const todos = response.data;
    
    const todoList = document.getElementById('todo-list');
    todoList!.innerHTML = '';
    
    todos.forEach(todo => {
      const li = document.createElement('li');
      li.innerHTML = `
        <input type="checkbox" ${todo.completed ? 'checked' : ''} 
               onchange="toggleTodo(${todo.id})">
        <span>${todo.title}</span>
        <button onclick="deleteTodo(${todo.id})">Delete</button>
      `;
      todoList!.appendChild(li);
    });
  } catch (error) {
    console.error('Failed to load todos:', error);
  }
}

// 创建 Todo
async function createTodo() {
  const input = document.getElementById('todo-input') as HTMLInputElement;
  const title = input.value.trim();
  
  if (!title) return;
  
  try {
    const response = await client.post<Todo>('/api/todos', { title });
    input.value = '';
    loadTodos();
  } catch (error) {
    console.error('Failed to create todo:', error);
  }
}

// 切换 Todo 完成状态
async function toggleTodo(id: number) {
  try {
    const response = await client.get<Todo>(`/api/todos/${id}`);
    const todo = response.data;
    
    await client.patch<Todo>(`/api/todos/${id}`, {
      completed: !todo.completed,
    });
    
    loadTodos();
  } catch (error) {
    console.error('Failed to toggle todo:', error);
  }
}

// 删除 Todo
async function deleteTodo(id: number) {
  try {
    await client.delete(`/api/todos/${id}`);
    loadTodos();
  } catch (error) {
    console.error('Failed to delete todo:', error);
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  loadTodos();
  
  const addButton = document.getElementById('add-button');
  addButton?.addEventListener('click', createTodo);
});
```

### HTML 模板

```html
<!DOCTYPE html>
<html>
<head>
  <title>Todo App</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 50px auto;
    }
    
    #todo-list {
      list-style: none;
      padding: 0;
    }
    
    #todo-list li {
      padding: 10px;
      border: 1px solid #ddd;
      margin: 5px 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    #todo-list input[type="checkbox"] {
      cursor: pointer;
    }
    
    #todo-list span {
      flex: 1;
    }
    
    #todo-list button {
      background: #ff6b6b;
      color: white;
      border: none;
      padding: 5px 10px;
      cursor: pointer;
    }
    
    .input-group {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    
    #todo-input {
      flex: 1;
      padding: 10px;
      border: 1px solid #ddd;
    }
    
    #add-button {
      padding: 10px 20px;
      background: #51cf66;
      color: white;
      border: none;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <h1>Todo App</h1>
  
  <div class="input-group">
    <input id="todo-input" type="text" placeholder="Add a new todo...">
    <button id="add-button">Add</button>
  </div>
  
  <ul id="todo-list"></ul>
  
  <script src="renderer.js"></script>
</body>
</html>
```

## 关键点

1. **类型安全** - 使用泛型参数确保类型安全
2. **错误处理** - 使用 try-catch 处理请求错误
3. **状态码** - 正确使用 HTTP 状态码（201 创建、404 未找到等）
4. **中间件** - 使用 Express 中间件处理日志、解析等
5. **RESTful API** - 遵循 REST 设计原则

## 下一步

查看 [高级用法](/examples/advanced) 了解更多复杂的场景。
