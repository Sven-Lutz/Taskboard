import TaskTableFilters from '@/components/table/TaskTableFilters'
import TaskTable from '@/components/table/TaskTable'

export default function TablePage() {
  return (
    <div className="p-6">
      <TaskTableFilters />
      <TaskTable />
    </div>
  )
}
