'use client'

import React from 'react'
import { Button } from '@/components/ui'
import { SortAsc, SortDesc } from 'lucide-react'
import {
    FilterSection,
    CheckboxFilter,
    RangeInput,
    DateInput,
    StatusSelector,
    packageStatuses,
    tripStatuses,
    packageCategories,
    transportModes,
} from '@/components/shared/FilterControls'

const SidebarContent = ({
    activeTab,
    packageFilters,
    setPackageFilters,
    tripFilters,
    setTripFilters,
    packageSortBy,
    setPackageSortBy,
    packageSortOrder,
    setPackageSortOrder,
    tripSortBy,
    setTripSortBy,
    tripSortOrder,
    setTripSortOrder,
    autoApply,
    setAutoApply,
    resultsPerPage,
    setResultsPerPage,
    packagesQuery,
    tripsQuery,
    setPackageCurrentPage,
    setTripCurrentPage,
    setPackageSearchInput,
    setTripSearchInput,
    handleTabChange,
}: any) => {
    return (
        <>
            {/* Tab Navigation */}
            <div className="flex items-center space-x-8 mb-4">
                <button
                    onClick={() => handleTabChange('packages')}
                    className={`pb-2 border-b-2 transition-colors ${activeTab === 'packages'
                        ? 'border-teal-500 text-teal-600 font-medium'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Packages
                </button>
                <button
                    onClick={() => handleTabChange('trips')}
                    className={`pb-2 border-b-2 transition-colors ${activeTab === 'trips'
                        ? 'border-teal-500 text-teal-600 font-medium'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Trips
                </button>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {activeTab === 'packages' ? 'Packages' : 'Trips'}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {activeTab === 'packages'
                            ? 'Find packages that need to be delivered'
                            : 'Discover travelers who can carry your packages'
                        }
                    </p>
                </div>
            </div>

            {/* Sort Controls */}
            <div className="mt-6 flex items-center space-x-2">
                <select
                    value={activeTab === 'packages' ? packageSortBy : tripSortBy}
                    onChange={(e) => {
                        if (activeTab === 'packages') {
                            setPackageSortBy(e.target.value)
                        } else {
                            setTripSortBy(e.target.value)
                        }
                    }}
                    className="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-teal-500"
                >
                    <option value="createdAt">Date Created</option>
                    <option value="updatedAt">Last Updated</option>
                    {activeTab === 'packages' ? (
                        <>
                            <option value="title">Title</option>
                            <option value="offeredPrice">Price</option>
                            <option value="pickupDate">Pickup Date</option>
                        </>
                    ) : (
                        <>
                            <option value="title">Title</option>
                            <option value="pricePerKg">Price per Kg</option>
                            <option value="departureDate">Departure Date</option>
                            <option value="arrivalDate">Arrival Date</option>
                        </>
                    )}
                </select>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        if (activeTab === 'packages') {
                            setPackageSortOrder(packageSortOrder === 'asc' ? 'desc' : 'asc')
                        } else {
                            setTripSortOrder(tripSortOrder === 'asc' ? 'desc' : 'asc')
                        }
                    }}
                    className="px-3"
                >
                    {(activeTab === 'packages' ? packageSortOrder : tripSortOrder) === 'asc' ? (
                        <SortAsc className="w-4 h-4" />
                    ) : (
                        <SortDesc className="w-4 h-4" />
                    )}
                </Button>
            </div>

            {/* Inline Filtering System */}
            <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800">Filters</h3>
                        <p className="text-xs text-gray-500">Use filters to refine results.</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <label className="flex items-center text-sm text-gray-600">
                            <input
                                type="checkbox"
                                className="mr-2 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 accent-teal-600"
                                checked={autoApply}
                                onChange={(e) => setAutoApply(e.target.checked)}
                            />
                            Auto-Apply
                        </label>
                    </div>
                </div>

                <div className="space-y-4">
                    {activeTab === 'packages' ? (
                        <>
                            <FilterSection title="Status">
                                <StatusSelector
                                    statuses={packageStatuses}
                                    selectedStatus={packageFilters.status}
                                    onStatusChange={(status) => setPackageFilters({ ...packageFilters, status })}
                                />
                            </FilterSection>

                            <FilterSection title="Category">
                                <select
                                    className="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-teal-500"
                                    value={packageFilters.category || ''}
                                    onChange={(e) => setPackageFilters({ ...packageFilters, category: e.target.value || undefined })}
                                >
                                    <option value="">All Categories</option>
                                    {packageCategories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </FilterSection>

                            <FilterSection title="Price Range">
                                <div className="flex items-center space-x-2">
                                    <RangeInput placeholder="Min" value={packageFilters.offeredPriceMin} onChange={(v) => setPackageFilters({ ...packageFilters, offeredPriceMin: v })} />
                                    <RangeInput placeholder="Max" value={packageFilters.offeredPriceMax} onChange={(v) => setPackageFilters({ ...packageFilters, offeredPriceMax: v })} />
                                </div>
                            </FilterSection>

                            <FilterSection title="Pickup Date">
                                <div className="flex items-center space-x-2">
                                    <DateInput value={packageFilters.pickupDateFrom} onChange={(v) => setPackageFilters({ ...packageFilters, pickupDateFrom: v })} />
                                    <DateInput value={packageFilters.pickupDateTo} onChange={(v) => setPackageFilters({ ...packageFilters, pickupDateTo: v })} />
                                </div>
                            </FilterSection>

                            <FilterSection title="Weight (kg)">
                                <div className="flex items-center space-x-2">
                                    <RangeInput placeholder="Min" value={packageFilters.weightMin} onChange={(v) => setPackageFilters({ ...packageFilters, weightMin: v })} />
                                    <RangeInput placeholder="Max" value={packageFilters.weightMax} onChange={(v) => setPackageFilters({ ...packageFilters, weightMax: v })} />
                                </div>
                            </FilterSection>

                            <FilterSection title="Attributes">
                                <CheckboxFilter label="Fragile" checked={!!packageFilters.isFragile} onChange={(v) => setPackageFilters({ ...packageFilters, isFragile: v })} />
                                <CheckboxFilter label="Perishable" checked={!!packageFilters.isPerishable} onChange={(v) => setPackageFilters({ ...packageFilters, isPerishable: v })} />
                                <CheckboxFilter label="Requires Signature" checked={!!packageFilters.requiresSignature} onChange={(v) => setPackageFilters({ ...packageFilters, requiresSignature: v })} />
                            </FilterSection>
                        </>
                    ) : (
                        <>
                            <FilterSection title="Status">
                                <StatusSelector
                                    statuses={tripStatuses}
                                    selectedStatus={tripFilters.status}
                                    onStatusChange={(status) => setTripFilters({ ...tripFilters, status })}
                                />
                            </FilterSection>

                            <FilterSection title="Transport Mode">
                                <select
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                                    value={tripFilters.transportMode || ''}
                                    onChange={(e) => setTripFilters({ ...tripFilters, transportMode: e.target.value || undefined })}
                                >
                                    <option value="">All Modes</option>
                                    {transportModes.map((mode) => (
                                        <option key={mode} value={mode}>{mode}</option>
                                    ))}
                                </select>
                            </FilterSection>

                            <FilterSection title="Price per Kg">
                                <div className="flex items-center space-x-2">
                                    <RangeInput placeholder="Min" value={tripFilters.pricePerKgMin} onChange={(v) => setTripFilters({ ...tripFilters, pricePerKgMin: v })} />
                                    <RangeInput placeholder="Max" value={tripFilters.pricePerKgMax} onChange={(v) => setTripFilters({ ...tripFilters, pricePerKgMax: v })} />
                                </div>
                            </FilterSection>

                            <FilterSection title="Departure Date">
                                <div className="flex items-center space-x-2">
                                    <DateInput value={tripFilters.departureDateFrom} onChange={(v) => setTripFilters({ ...tripFilters, departureDateFrom: v })} />
                                    <DateInput value={tripFilters.departureDateTo} onChange={(v) => setTripFilters({ ...tripFilters, departureDateTo: v })} />
                                </div>
                            </FilterSection>

                            <FilterSection title="Arrival Date">
                                <div className="flex items-center space-x-2">
                                    <DateInput value={tripFilters.arrivalDateFrom} onChange={(v) => setTripFilters({ ...tripFilters, arrivalDateFrom: v })} />
                                    <DateInput value={tripFilters.arrivalDateTo} onChange={(v) => setTripFilters({ ...tripFilters, arrivalDateTo: v })} />
                                </div>
                            </FilterSection>

                            <FilterSection title="Max Weight (kg)">
                                <div className="flex items-center space-x-2">
                                    <RangeInput placeholder="Min" value={tripFilters.maxWeightMin} onChange={(v) => setTripFilters({ ...tripFilters, maxWeightMin: v })} />
                                    <RangeInput placeholder="Max" value={tripFilters.maxWeightMax} onChange={(v) => setTripFilters({ ...tripFilters, maxWeightMax: v })} />
                                </div>
                            </FilterSection>

                            <FilterSection title="Can Carry">
                                <CheckboxFilter label="Fragile Items" checked={!!tripFilters.canCarryFragile} onChange={(v) => setTripFilters({ ...tripFilters, canCarryFragile: v })} />
                                <CheckboxFilter label="Perishable Items" checked={!!tripFilters.canCarryPerishable} onChange={(v) => setTripFilters({ ...tripFilters, canCarryPerishable: v })} />
                            </FilterSection>
                        </>
                    )}
                </div>

                {/* Reset Filters and Apply Buttons */}
                <div className="mt-6 flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={() => {
                            if (activeTab === 'packages') {
                                setPackageFilters({
                                    status: undefined, category: undefined, offeredPriceMin: undefined, offeredPriceMax: undefined,
                                    pickupDateFrom: undefined, pickupDateTo: undefined, deliveryDateFrom: undefined, deliveryDateTo: undefined,
                                    weightMin: undefined, weightMax: undefined, isFragile: false, isPerishable: false, requiresSignature: false,
                                })
                                setPackageSearchInput('')
                            } else {
                                setTripFilters({
                                    status: undefined, transportMode: undefined, pricePerKgMin: undefined, pricePerKgMax: undefined,
                                    departureDateFrom: undefined, departureDateTo: undefined, arrivalDateFrom: undefined, arrivalDateTo: undefined,
                                    maxWeightMin: undefined, maxWeightMax: undefined, canCarryFragile: false, canCarryPerishable: false,
                                })
                                setTripSearchInput('')
                            }
                        }}
                    >
                        Clear All
                    </Button>

                    <Button
                        onClick={() => {
                            if (activeTab === 'packages') {
                                packagesQuery.refetch()
                                setPackageCurrentPage(1)
                            } else {
                                tripsQuery.refetch()
                                setTripCurrentPage(1)
                            }
                        }}
                        disabled={autoApply}
                        className={autoApply ? 'cursor-not-allowed' : ''}
                    >
                        Apply
                    </Button>
                </div>

                {/* Results Summary */}
                <div className="mt-4 border-t border-gray-200 pt-4">
                    <label className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">Per page</span>
                        <select
                            value={resultsPerPage}
                            onChange={(e) => setResultsPerPage(Number(e.target.value))}
                            className="px-2 py-1 border rounded"
                        >
                            {[6, 12, 24, 48].map((n) => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </label>
                </div>
            </div>
        </>
    )
}

export default SidebarContent
