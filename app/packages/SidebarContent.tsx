'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui'
import { SortAsc, SortDesc } from 'lucide-react'
import { useDebounce } from '@/lib/hooks/useDebounce'
import {
    FilterSection,
    CheckboxFilter,
    RangeInput,
    DateInput,
    TextInput,
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
    // Debounced states for package filters
    const [packageOfferedPriceMin, setPackageOfferedPriceMin] = useState(packageFilters.offeredPriceMin);
    const debouncedPackageOfferedPriceMin = useDebounce(packageOfferedPriceMin, 300);
    const [packageOfferedPriceMax, setPackageOfferedPriceMax] = useState(packageFilters.offeredPriceMax);
    const debouncedPackageOfferedPriceMax = useDebounce(packageOfferedPriceMax, 300);
    const [packageFinalPriceMin, setPackageFinalPriceMin] = useState(packageFilters.finalPriceMin);
    const debouncedPackageFinalPriceMin = useDebounce(packageFinalPriceMin, 300);
    const [packageFinalPriceMax, setPackageFinalPriceMax] = useState(packageFilters.finalPriceMax);
    const debouncedPackageFinalPriceMax = useDebounce(packageFinalPriceMax, 300);
    const [packageValueMin, setPackageValueMin] = useState(packageFilters.valueMin);
    const debouncedPackageValueMin = useDebounce(packageValueMin, 300);
    const [packageValueMax, setPackageValueMax] = useState(packageFilters.valueMax);
    const debouncedPackageValueMax = useDebounce(packageValueMax, 300);

    // Debounced states for trip filters
    const [tripPricePerKgMin, setTripPricePerKgMin] = useState(tripFilters.pricePerKgMin);
    const debouncedTripPricePerKgMin = useDebounce(tripPricePerKgMin, 300);
    const [tripPricePerKgMax, setTripPricePerKgMax] = useState(tripFilters.pricePerKgMax);
    const debouncedTripPricePerKgMax = useDebounce(tripPricePerKgMax, 300);
    const [tripMinimumPriceMin, setTripMinimumPriceMin] = useState(tripFilters.minimumPriceMin);
    const debouncedTripMinimumPriceMin = useDebounce(tripMinimumPriceMin, 300);
    const [tripMinimumPriceMax, setTripMinimumPriceMax] = useState(tripFilters.minimumPriceMax);
    const debouncedTripMinimumPriceMax = useDebounce(tripMinimumPriceMax, 300);
    const [tripMaximumPriceMin, setTripMaximumPriceMin] = useState(tripFilters.maximumPriceMin);
    const debouncedTripMaximumPriceMin = useDebounce(tripMaximumPriceMin, 300);
    const [tripMaximumPriceMax, setTripMaximumPriceMax] = useState(tripFilters.maximumPriceMax);
    const debouncedTripMaximumPriceMax = useDebounce(tripMaximumPriceMax, 300);
    const [tripMaxWeightMin, setTripMaxWeightMin] = useState(tripFilters.maxWeightMin);
    const debouncedTripMaxWeightMin = useDebounce(tripMaxWeightMin, 300);
    const [tripMaxWeightMax, setTripMaxWeightMax] = useState(tripFilters.maxWeightMax);
    const debouncedTripMaxWeightMax = useDebounce(tripMaxWeightMax, 300);
    const [tripAvailableSpaceMin, setTripAvailableSpaceMin] = useState(tripFilters.availableSpaceMin);
    const debouncedTripAvailableSpaceMin = useDebounce(tripAvailableSpaceMin, 300);
    const [tripAvailableSpaceMax, setTripAvailableSpaceMax] = useState(tripFilters.availableSpaceMax);
    const debouncedTripAvailableSpaceMax = useDebounce(tripAvailableSpaceMax, 300);

    // Debounced states for location inputs
    const [packagePickupCity, setPackagePickupCity] = useState(packageFilters.pickupCity);
    const debouncedPackagePickupCity = useDebounce(packagePickupCity, 300);
    const [packagePickupCountry, setPackagePickupCountry] = useState(packageFilters.pickupCountry);
    const debouncedPackagePickupCountry = useDebounce(packagePickupCountry, 300);
    const [packageDeliveryCity, setPackageDeliveryCity] = useState(packageFilters.deliveryCity);
    const debouncedPackageDeliveryCity = useDebounce(packageDeliveryCity, 300);
    const [packageDeliveryCountry, setPackageDeliveryCountry] = useState(packageFilters.deliveryCountry);
    const debouncedPackageDeliveryCountry = useDebounce(packageDeliveryCountry, 300);

    const [tripOriginCity, setTripOriginCity] = useState(tripFilters.originCity);
    const debouncedTripOriginCity = useDebounce(tripOriginCity, 300);
    const [tripOriginCountry, setTripOriginCountry] = useState(tripFilters.originCountry);
    const debouncedTripOriginCountry = useDebounce(tripOriginCountry, 300);
    const [tripDestinationCity, setTripDestinationCity] = useState(tripFilters.destinationCity);
    const debouncedTripDestinationCity = useDebounce(tripDestinationCity, 300);
    const [tripDestinationCountry, setTripDestinationCountry] = useState(tripFilters.destinationCountry);
    const debouncedTripDestinationCountry = useDebounce(tripDestinationCountry, 300);

    // Update package filters on debounced changes
    useEffect(() => {
        setPackageFilters((prev: any) => ({ ...prev, offeredPriceMin: debouncedPackageOfferedPriceMin }));
    }, [debouncedPackageOfferedPriceMin, setPackageFilters]);

    useEffect(() => {
        setPackageFilters((prev: any) => ({ ...prev, offeredPriceMax: debouncedPackageOfferedPriceMax }));
    }, [debouncedPackageOfferedPriceMax, setPackageFilters]);

    useEffect(() => {
        setPackageFilters((prev: any) => ({ ...prev, finalPriceMin: debouncedPackageFinalPriceMin }));
    }, [debouncedPackageFinalPriceMin, setPackageFilters]);

    useEffect(() => {
        setPackageFilters((prev: any) => ({ ...prev, finalPriceMax: debouncedPackageFinalPriceMax }));
    }, [debouncedPackageFinalPriceMax, setPackageFilters]);

    useEffect(() => {
        setPackageFilters((prev: any) => ({ ...prev, valueMin: debouncedPackageValueMin }));
    }, [debouncedPackageValueMin, setPackageFilters]);

    useEffect(() => {
        setPackageFilters((prev: any) => ({ ...prev, valueMax: debouncedPackageValueMax }));
    }, [debouncedPackageValueMax, setPackageFilters]);

    // Update trip filters on debounced changes
    useEffect(() => {
        setTripFilters((prev: any) => ({ ...prev, pricePerKgMin: debouncedTripPricePerKgMin }));
    }, [debouncedTripPricePerKgMin, setTripFilters]);

    useEffect(() => {
        setTripFilters((prev: any) => ({ ...prev, pricePerKgMax: debouncedTripPricePerKgMax }));
    }, [debouncedTripPricePerKgMax, setTripFilters]);

    useEffect(() => {
        setTripFilters((prev: any) => ({ ...prev, minimumPriceMin: debouncedTripMinimumPriceMin }));
    }, [debouncedTripMinimumPriceMin, setTripFilters]);

    useEffect(() => {
        setTripFilters((prev: any) => ({ ...prev, minimumPriceMax: debouncedTripMinimumPriceMax }));
    }, [debouncedTripMinimumPriceMax, setTripFilters]);

    useEffect(() => {
        setTripFilters((prev: any) => ({ ...prev, maximumPriceMin: debouncedTripMaximumPriceMin }));
    }, [debouncedTripMaximumPriceMin, setTripFilters]);

    useEffect(() => {
        setTripFilters((prev: any) => ({ ...prev, maximumPriceMax: debouncedTripMaximumPriceMax }));
    }, [debouncedTripMaximumPriceMax, setTripFilters]);

    useEffect(() => {
        setTripFilters((prev: any) => ({ ...prev, maxWeightMin: debouncedTripMaxWeightMin }));
    }, [debouncedTripMaxWeightMin, setTripFilters]);

    useEffect(() => {
        setTripFilters((prev: any) => ({ ...prev, maxWeightMax: debouncedTripMaxWeightMax }));
    }, [debouncedTripMaxWeightMax, setTripFilters]);

    useEffect(() => {
        setTripFilters((prev: any) => ({ ...prev, availableSpaceMin: debouncedTripAvailableSpaceMin }));
    }, [debouncedTripAvailableSpaceMin, setTripFilters]);

    useEffect(() => {
        setTripFilters((prev: any) => ({ ...prev, availableSpaceMax: debouncedTripAvailableSpaceMax }));
    }, [debouncedTripAvailableSpaceMax, setTripFilters]);

    // Update location filters on debounced changes
    useEffect(() => {
        setPackageFilters((prev: any) => ({ ...prev, pickupCity: debouncedPackagePickupCity }));
    }, [debouncedPackagePickupCity, setPackageFilters]);

    useEffect(() => {
        setPackageFilters((prev: any) => ({ ...prev, pickupCountry: debouncedPackagePickupCountry }));
    }, [debouncedPackagePickupCountry, setPackageFilters]);

    useEffect(() => {
        setPackageFilters((prev: any) => ({ ...prev, deliveryCity: debouncedPackageDeliveryCity }));
    }, [debouncedPackageDeliveryCity, setPackageFilters]);

    useEffect(() => {
        setPackageFilters((prev: any) => ({ ...prev, deliveryCountry: debouncedPackageDeliveryCountry }));
    }, [debouncedPackageDeliveryCountry, setPackageFilters]);

    useEffect(() => {
        setTripFilters((prev: any) => ({ ...prev, originCity: debouncedTripOriginCity }));
    }, [debouncedTripOriginCity, setTripFilters]);

    useEffect(() => {
        setTripFilters((prev: any) => ({ ...prev, originCountry: debouncedTripOriginCountry }));
    }, [debouncedTripOriginCountry, setTripFilters]);

    useEffect(() => {
        setTripFilters((prev: any) => ({ ...prev, destinationCity: debouncedTripDestinationCity }));
    }, [debouncedTripDestinationCity, setTripFilters]);

    useEffect(() => {
        setTripFilters((prev: any) => ({ ...prev, destinationCountry: debouncedTripDestinationCountry }));
    }, [debouncedTripDestinationCountry, setTripFilters]);

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
                            <option value="offeredPrice">Offered Price</option>
                            <option value="finalPrice">Final Price</option>
                            <option value="value">Package Value</option>
                            <option value="pickupDate">Pickup Date</option>
                            <option value="deliveryDate">Delivery Date</option>
                            <option value="category">Category</option>
                            <option value="priority">Priority</option>
                            <option value="createdAt">Created Date</option>
                            <option value="updatedAt">Updated Date</option>
                        </>
                    ) : (
                        <>
                            <option value="title">Title</option>
                            <option value="pricePerKg">Price per Kg</option>
                            <option value="minimumPrice">Minimum Price</option>
                            <option value="maximumPrice">Maximum Price</option>
                            <option value="maxWeight">Max Weight</option>
                            <option value="availableSpace">Available Space</option>
                            <option value="departureDate">Departure Date</option>
                            <option value="arrivalDate">Arrival Date</option>
                            <option value="transportMode">Transport Mode</option>
                            <option value="createdAt">Created Date</option>
                            <option value="updatedAt">Updated Date</option>
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
                                    <RangeInput placeholder="Min" value={packageOfferedPriceMin} onChange={setPackageOfferedPriceMin} />
                                    <RangeInput placeholder="Max" value={packageOfferedPriceMax} onChange={setPackageOfferedPriceMax} />
                                </div>
                            </FilterSection>

                            <FilterSection title="Final Price Range">
                                <div className="flex items-center space-x-2">
                                    <RangeInput placeholder="Min" value={packageFinalPriceMin} onChange={setPackageFinalPriceMin} />
                                    <RangeInput placeholder="Max" value={packageFinalPriceMax} onChange={setPackageFinalPriceMax} />
                                </div>
                            </FilterSection>

                            <FilterSection title="Package Value">
                                <div className="flex items-center space-x-2">
                                    <RangeInput placeholder="Min" value={packageValueMin} onChange={setPackageValueMin} />
                                    <RangeInput placeholder="Max" value={packageValueMax} onChange={setPackageValueMax} />
                                </div>
                            </FilterSection>

                            <FilterSection title="Pickup Date">
                                <div className="flex items-center space-x-2">
                                    <DateInput value={packageFilters.pickupDateFrom} onChange={(v) => setPackageFilters({ ...packageFilters, pickupDateFrom: v })} />
                                    <DateInput value={packageFilters.pickupDateTo} onChange={(v) => setPackageFilters({ ...packageFilters, pickupDateTo: v })} />
                                </div>
                            </FilterSection>

                            <FilterSection title="Delivery Date">
                                <div className="flex items-center space-x-2">
                                    <DateInput value={packageFilters.deliveryDateFrom} onChange={(v) => setPackageFilters({ ...packageFilters, deliveryDateFrom: v })} />
                                    <DateInput value={packageFilters.deliveryDateTo} onChange={(v) => setPackageFilters({ ...packageFilters, deliveryDateTo: v })} />
                                </div>
                            </FilterSection>

                            <FilterSection title="Pickup Location">
                                <div className="space-y-2">
                                    <TextInput placeholder="City" value={packagePickupCity} onChange={setPackagePickupCity} />
                                    <TextInput placeholder="Country" value={packagePickupCountry} onChange={setPackagePickupCountry} />
                                </div>
                            </FilterSection>

                            <FilterSection title="Delivery Location">
                                <div className="space-y-2">
                                    <TextInput placeholder="City" value={packageDeliveryCity} onChange={setPackageDeliveryCity} />
                                    <TextInput placeholder="Country" value={packageDeliveryCountry} onChange={setPackageDeliveryCountry} />
                                </div>
                            </FilterSection>

                            <FilterSection title="Priority">
                                <select
                                    className="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-teal-500"
                                    value={packageFilters.priority || ''}
                                    onChange={(e) => setPackageFilters({ ...packageFilters, priority: e.target.value || undefined })}
                                >
                                    <option value="">All Priorities</option>
                                    <option value="low">Low</option>
                                    <option value="normal">Normal</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </FilterSection>

                            <FilterSection title="Attributes">
                                <CheckboxFilter label="Fragile" checked={!!packageFilters.isFragile} onChange={(v) => setPackageFilters({ ...packageFilters, isFragile: v })} />
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
                                        <option key={mode} value={mode}>{mode.charAt(0).toUpperCase() + mode.slice(1)}</option>
                                    ))}
                                </select>
                            </FilterSection>

                            <FilterSection title="Price per Kg">
                                <div className="flex items-center space-x-2">
                                    <RangeInput placeholder="Min" value={tripPricePerKgMin} onChange={setTripPricePerKgMin} />
                                    <RangeInput placeholder="Max" value={tripPricePerKgMax} onChange={setTripPricePerKgMax} />
                                </div>
                            </FilterSection>

                            <FilterSection title="Minimum Price">
                                <div className="flex items-center space-x-2">
                                    <RangeInput placeholder="Min" value={tripMinimumPriceMin} onChange={setTripMinimumPriceMin} />
                                    <RangeInput placeholder="Max" value={tripMinimumPriceMax} onChange={setTripMinimumPriceMax} />
                                </div>
                            </FilterSection>

                            <FilterSection title="Maximum Price">
                                <div className="flex items-center space-x-2">
                                    <RangeInput placeholder="Min" value={tripMaximumPriceMin} onChange={setTripMaximumPriceMin} />
                                    <RangeInput placeholder="Max" value={tripMaximumPriceMax} onChange={setTripMaximumPriceMax} />
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
                                    <RangeInput placeholder="Min" value={tripMaxWeightMin} onChange={setTripMaxWeightMin} />
                                    <RangeInput placeholder="Max" value={tripMaxWeightMax} onChange={setTripMaxWeightMax} />
                                </div>
                            </FilterSection>

                            <FilterSection title="Available Space">
                                <div className="flex items-center space-x-2">
                                    <RangeInput placeholder="Min" value={tripAvailableSpaceMin} onChange={setTripAvailableSpaceMin} />
                                    <RangeInput placeholder="Max" value={tripAvailableSpaceMax} onChange={setTripAvailableSpaceMax} />
                                </div>
                            </FilterSection>

                            <FilterSection title="Origin Location">
                                <div className="space-y-2">
                                    <TextInput placeholder="City" value={tripOriginCity} onChange={setTripOriginCity} />
                                    <TextInput placeholder="Country" value={tripOriginCountry} onChange={setTripOriginCountry} />
                                </div>
                            </FilterSection>

                            <FilterSection title="Destination Location">
                                <div className="space-y-2">
                                    <TextInput placeholder="City" value={tripDestinationCity} onChange={setTripDestinationCity} />
                                    <TextInput placeholder="Country" value={tripDestinationCountry} onChange={setTripDestinationCountry} />
                                </div>
                            </FilterSection>

                            <FilterSection title="Flexible Dates">
                                <CheckboxFilter label="Flexible Dates" checked={!!tripFilters.flexibleDates} onChange={(v) => setTripFilters({ ...tripFilters, flexibleDates: v })} />
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
                                    isFragile: undefined, requiresSignature: undefined,
                                })
                                setPackageSearchInput('')
                                // Reset debounced location states
                                setPackagePickupCity(undefined)
                                setPackagePickupCountry(undefined)
                                setPackageDeliveryCity(undefined)
                                setPackageDeliveryCountry(undefined)
                            } else {
                                setTripFilters({
                                    status: undefined, transportMode: undefined, pricePerKgMin: undefined, pricePerKgMax: undefined,
                                    departureDateFrom: undefined, departureDateTo: undefined, arrivalDateFrom: undefined, arrivalDateTo: undefined,
                                    maxWeightMin: undefined, maxWeightMax: undefined, flexibleDates: undefined,
                                })
                                setTripSearchInput('')
                                // Reset debounced location states
                                setTripOriginCity(undefined)
                                setTripOriginCountry(undefined)
                                setTripDestinationCity(undefined)
                                setTripDestinationCountry(undefined)
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
