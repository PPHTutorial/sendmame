'use client'

import { Button, Input } from '@/components/ui'
import { PackageStatus, TripStatus } from '@prisma/client'

interface FilterSectionProps {
    title: string
    children: React.ReactNode
}

export const FilterSection = ({ title, children }: FilterSectionProps) => (
    <div className="py-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">{title}</h3>
        <div className="space-y-3">{children}</div>
    </div>
)

interface CheckboxFilterProps {
    label: string
    checked: boolean
    onChange: (checked: boolean) => void
}

export const CheckboxFilter = ({ label, checked, onChange }: CheckboxFilterProps) => (
    <label className="flex items-center text-sm text-gray-600">
        <input
            type="checkbox"
            className="mr-2 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 accent-teal-600"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
        />
        {label}
    </label>
)

interface RangeInputProps {
    placeholder: string
    value: number | undefined
    onChange: (value: number | undefined) => void
}

export const RangeInput = ({ placeholder, value, onChange }: RangeInputProps) => (
    <Input
        type="number"
        placeholder={placeholder}
        value={value || ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
        className="w-full"
    />
)

interface DateInputProps {
    value: string | undefined
    onChange: (value: string | undefined) => void
}

export const DateInput = ({ value, onChange }: DateInputProps) => (
    <Input
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="w-full"
    />
)

interface TextInputProps {
    placeholder: string
    value: string | undefined
    onChange: (value: string | undefined) => void
}

export const TextInput = ({ placeholder, value, onChange }: TextInputProps) => (
    <Input
        type="text"
        placeholder={placeholder}
        value={value || ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="w-full"
    />
)

interface StatusSelectorProps<T extends string> {
    statuses: readonly T[]
    selectedStatus: T | undefined
    onStatusChange: (status: T | undefined) => void
}

export const StatusSelector = <T extends string>({
    statuses,
    selectedStatus,
    onStatusChange,
}: StatusSelectorProps<T>) => (
    <div className="flex flex-wrap gap-2">
        <Button
            variant={!selectedStatus ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => onStatusChange(undefined)}
            className="text-xs"
        >
            All
        </Button>
        {statuses.map((status) => (
            <Button
                key={status}
                variant={selectedStatus === status ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => onStatusChange(status)}
                className="text-xs"
            >
                {status.replace('_', ' ')}
            </Button>
        ))}
    </div>
)

export const packageStatuses = Object.values(PackageStatus)
export const tripStatuses = Object.values(TripStatus)

export const packageCategories = [
    'Documents',
    'Electronics',
    'Clothing',
    'Books',
    'Food',
    'Gifts',
    'Other',
]

export const transportModes = ['car', 'plane', 'train', 'bus', 'ship', 'other']
