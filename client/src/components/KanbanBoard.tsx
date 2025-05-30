// update the functions

import PlusIcon from "../icons/PlusIcon";
import { useEffect, useMemo, useState } from "react";
import { Column, Id, Task } from "../types";
import ColumnContainer from "./ColumnContainer";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";

// const defaultCols: Column[] = [
//   {
//     id: "todo",
//     title: "Todo",
//   },
//   {
//     id: "doing",
//     title: "Work in progress",
//   },
//   {
//     id: "done",
//     title: "Done",
//   },
// ];

// const defaultTasks: Task[] = [
//   {
//     id: "1",
//     columnId: "todo",
//     content: "List admin APIs for dashboard",
//   },
//   {
//     id: "2",
//     columnId: "todo",
//     content:
//       "Develop user registration functionality with OTP delivered on SMS after email confirmation and phone number confirmation",
//   },
//   {
//     id: "3",
//     columnId: "doing",
//     content: "Conduct security testing",
//   },
//   {
//     id: "4",
//     columnId: "doing",
//     content: "Analyze competitors",
//   },
//   {
//     id: "5",
//     columnId: "done",
//     content: "Create UI kit documentation",
//   },
//   {
//     id: "6",
//     columnId: "done",
//     content: "Dev meeting",
//   },
//   {
//     id: "7",
//     columnId: "done",
//     content: "Deliver dashboard prototype",
//   },
//   {
//     id: "8",
//     columnId: "todo",
//     content: "Optimize application performance",
//   },
//   {
//     id: "9",
//     columnId: "todo",
//     content: "Implement data validation",
//   },
//   {
//     id: "10",
//     columnId: "todo",
//     content: "Design database schema",
//   },
//   {
//     id: "11",
//     columnId: "todo",
//     content: "Integrate SSL web certificates into workflow",
//   },
//   {
//     id: "12",
//     columnId: "doing",
//     content: "Implement error logging and monitoring",
//   },
//   {
//     id: "13",
//     columnId: "doing",
//     content: "Design and implement responsive UI",
//   },
// ];

function KanbanBoard() {
  /* ############################################################################################ */

  // Load tasks and columns from local storage when component mounts
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const savedTasks = localStorage.getItem("tasks");
      return savedTasks ? JSON.parse(savedTasks) : [];
    } catch (error) {
      console.error("Failed to parse tasks from local storage:", error);
      return [];
    }
  });

  const [columns, setColumns] = useState<Column[]>(() => {
    try {
      const savedColumns = localStorage.getItem("columns");
      return savedColumns ? JSON.parse(savedColumns) : [];
    } catch (error) {
      console.error("Failed to parse columns from local storage:", error);
      return [];
    }
  });

  /* ############################################################################################ */

  // const [columns, setColumns] = useState<Column[]>(defaultCols);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  // const [tasks, setTasks] = useState<Task[]>(defaultTasks);

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  // Save tasks and columns to local storage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("tasks", JSON.stringify(tasks));
      localStorage.setItem("columns", JSON.stringify(columns));
    } catch (error) {
      console.error("Failed to save tasks or columns to local storage:", error);
    }
    console.log("Active Task ==", activeTask);
    console.log("Active Column ==", activeColumn);
  }, [tasks, columns]);

  return (
    <div
      className="
        m-auto
        flex
        min-h-screen
        w-full
        items-center
        overflow-x-auto
        overflow-y-hidden
        px-[40px]
    "
    >
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <div className="m-auto flex gap-4">
          <div className="flex gap-4">
            <SortableContext items={columnsId}>
              {columns.map((col) => (
                <ColumnContainer
                  key={col.id}
                  column={col}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  createTask={createTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  tasks={tasks.filter((task) => task.columnId === col.id)}
                />
              ))}
            </SortableContext>
          </div>

          {/* button className -- border-2
      border-columnBackgroundColor */}
          <button
            onClick={() => {
              createNewColumn();
            }}
            className="
      h-[60px]
      w-[350px]
      min-w-[350px]
      cursor-pointer
      rounded-full
      bg-mainBackgroundColor
      transition-all
      ease-in-out     
      duration-200
      shadow-md
      shadow-gray-800
      p-4
      flex
      gap-2
      opacity-95
      hover:opacity-100
      hover:bg-[#000]
      "
          >
            <PlusIcon />
            Add Column
          </button>
        </div>

        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                column={activeColumn}
                deleteColumn={deleteColumn}
                updateColumn={updateColumn}
                createTask={createTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
                tasks={tasks.filter(
                  (task) => task.columnId === activeColumn.id
                )}
              />
            )}
            {activeTask && (
              <TaskCard
                task={activeTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );

  function createTask(columnId: Id) {
    const newTask: Task = {
      id: generateId(),
      columnId,
      // content: `Task ${tasks.length + 1}`,
      content: ``,
    };

    setTasks((prevTasks) => [...prevTasks, newTask]);
  }

  function deleteTask(id: Id) {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  }

  function updateTask(id: Id, content: string) {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === id ? { ...task, content } : task))
    );
  }

  function createNewColumn() {
    const columnToAdd: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    };

    setColumns((prevColumns) => [...prevColumns, columnToAdd]);
  }

  function deleteColumn(id: Id) {
    setColumns((prevColumns) => prevColumns.filter((col) => col.id !== id));

    setTasks((prevTasks) => prevTasks.filter((task) => task.columnId !== id));
  }

  function updateColumn(id: Id, title: string) {
    setColumns((prevColumns) =>
      prevColumns.map((col) => (col.id === id ? { ...col, title } : col))
    );
  }

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }

    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveAColumn = active.data.current?.type === "Column";
    if (!isActiveAColumn) return;

    console.log("DRAG END");

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex((col) => col.id === activeId);

      const overColumnIndex = columns.findIndex((col) => col.id === overId);

      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (!isActiveATask) return;

    // Im dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[activeIndex].columnId != tasks[overIndex].columnId) {
          // Fix introduced after video recording
          tasks[activeIndex].columnId = tasks[overIndex].columnId;
          return arrayMove(tasks, activeIndex, overIndex - 1);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = over.data.current?.type === "Column";

    // Im dropping a Task over a column
    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);

        tasks[activeIndex].columnId = overId;
        console.log("DROPPING TASK OVER COLUMN", { activeIndex });
        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  }
}

function generateId() {
  /* Generate a random number between 0 and 10000 */
  return Math.floor(Math.random() * 10001);
}

export default KanbanBoard;
