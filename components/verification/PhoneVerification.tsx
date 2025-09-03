'use client'

import React, { useState } from 'react'
import { Button, Input } from '@/components/ui'
import { Phone, CheckCircle, Clock, ChevronDown } from 'lucide-react'
import parsePhoneNumberFromString, { isValidPhoneNumber, CountryCode } from 'libphonenumber-js'
import * as flags from 'country-flag-icons/react/3x2'
import toast from 'react-hot-toast'

interface Country {
    code: string
    dial: string
    name: string
}

interface PhoneVerificationProps {
    onClose: () => void
}

const countries: Country[] = [
    { code: "GH", dial: "+233", name: "Ghana" },
    { code: "US", dial: "+1", name: "United States" },
    { code: "GB", dial: "+44", name: "United Kingdom" },
    { code: "NG", dial: "+234", name: "Nigeria" },
    { code: "IN", dial: "+91", name: "India" },
    { code: "CA", dial: "+1", name: "Canada" },
    { code: "FR", dial: "+33", name: "France" },
    { code: "DE", dial: "+49", name: "Germany" },
    { code: "JP", dial: "+81", name: "Japan" },
    { code: "CN", dial: "+86", name: "China" },
    { code: "AU", dial: "+61", name: "Australia" },
    { code: "BR", dial: "+55", name: "Brazil" },
    { code: "ES", dial: "+34", name: "Spain" },
    { code: "IT", dial: "+39", name: "Italy" },
    { code: "RU", dial: "+7", name: "Russia" },
    { code: "ZA", dial: "+27", name: "South Africa" },
    { code: "KR", dial: "+82", name: "South Korea" },
    { code: "ID", dial: "+62", name: "Indonesia" },
    { code: "SA", dial: "+966", name: "Saudi Arabia" },
    { code: "TR", dial: "+90", name: "Turkey" },
    { code: "AE", dial: "+971", name: "United Arab Emirates" },
    { code: "FI", dial: "+358", name: "Finland" },
    { code: "SE", dial: "+46", name: "Sweden" },
    { code: "CH", dial: "+41", name: "Switzerland" },
    { code: "PL", dial: "+48", name: "Poland" },
    { code: "PH", dial: "+63", name: "Philippines" },
    { code: "MX", dial: "+52", name: "Mexico" },
    { code: "NZ", dial: "+64", name: "New Zealand" },
    { code: "NO", dial: "+47", name: "Norway" },
    { code: "SG", dial: "+65", name: "Singapore" },
    { code: "EG", dial: "+20", name: "Egypt" },
    { code: "MA", dial: "+212", name: "Morocco" },
    { code: "KE", dial: "+254", name: "Kenya" },
    { code: "IL", dial: "+972", name: "Israel" },
    { code: "BD", dial: "+880", name: "Bangladesh" },
    { code: "VN", dial: "+84", name: "Vietnam" },
    { code: "TH", dial: "+66", name: "Thailand" },
    { code: "PT", dial: "+351", name: "Portugal" },
    { code: "NL", dial: "+31", name: "Netherlands" },
    { code: "BE", dial: "+32", name: "Belgium" },
    { code: "AT", dial: "+43", name: "Austria" },
    { code: "IE", dial: "+353", name: "Ireland" },
    { code: "DK", dial: "+45", name: "Denmark" },
    { code: "BY", dial: "+375", name: "Belarus" },
    { code: "AZ", dial: "+994", name: "Azerbaijan" },
    { code: "UA", dial: "+380", name: "Ukraine" },
    { code: "EE", dial: "+372", name: "Estonia" },
    { code: "LT", dial: "+370", name: "Lithuania" },
    { code: "LV", dial: "+371", name: "Latvia" },
    { code: "SI", dial: "+386", name: "Slovenia" },
    { code: "CZ", dial: "+420", name: "Czech Republic" },
    { code: "SK", dial: "+421", name: "Slovakia" },
    { code: "HU", dial: "+36", name: "Hungary" },
    { code: "RO", dial: "+40", name: "Romania" },
    { code: "RS", dial: "+381", name: "Serbia" },
    { code: "ME", dial: "+382", name: "Montenegro" },
    { code: "BA", dial: "+387", name: "Bosnia and Herzegovina" },
    { code: "MK", dial: "+389", name: "North Macedonia" },
    { code: "MD", dial: "+373", name: "Moldova" },
    { code: "GE", dial: "+995", name: "Georgia" },
    { code: "UZ", dial: "+998", name: "Uzbekistan" },
    { code: "TM", dial: "+993", name: "Turkmenistan" },
    { code: "KG", dial: "+996", name: "Kyrgyzstan" },
    { code: "TJ", dial: "+992", name: "Tajikistan" },
    { code: "KZ", dial: "+7", name: "Kazakhstan" },
    { code: "PK", dial: "+92", name: "Pakistan" },
    { code: "IR", dial: "+98", name: "Iran" },
    { code: "IQ", dial: "+964", name: "Iraq" },
    { code: "SY", dial: "+963", name: "Syria" },
    { code: "JO", dial: "+962", name: "Jordan" },
    { code: "LB", dial: "+961", name: "Lebanon" },
    { code: "OM", dial: "+968", name: "Oman" },
    { code: "YE", dial: "+967", name: "Yemen" },
    { code: "QA", dial: "+974", name: "Qatar" },
    { code: "BH", dial: "+973", name: "Bahrain" },
    { code: "KW", dial: "+965", name: "Kuwait" },
    { code: "AF", dial: "+93", name: "Afghanistan" },
    { code: "NP", dial: "+977", name: "Nepal" },
    { code: "LK", dial: "+94", name: "Sri Lanka" },
    { code: "MM", dial: "+95", name: "Myanmar" },
    { code: "KH", dial: "+855", name: "Cambodia" },
    { code: "LA", dial: "+856", name: "Laos" },
    { code: "MN", dial: "+976", name: "Mongolia" },
    { code: "TW", dial: "+886", name: "Taiwan" },
    { code: "HK", dial: "+852", name: "Hong Kong" },
    { code: "MO", dial: "+853", name: "Macau" },
    { code: "MY", dial: "+60", name: "Malaysia" },
    { code: "TL", dial: "+670", name: "Timor-Leste" },
    { code: "FJ", dial: "+679", name: "Fiji" },
    { code: "PG", dial: "+675", name: "Papua New Guinea" },
    { code: "SB", dial: "+677", name: "Solomon Islands" },
    { code: "VU", dial: "+678", name: "Vanuatu" },
    { code: "NC", dial: "+687", name: "New Caledonia" },
    { code: "PF", dial: "+689", name: "French Polynesia" },
    { code: "TO", dial: "+676", name: "Tonga" },
    { code: "WS", dial: "+685", name: "Samoa" },
    { code: "KI", dial: "+686", name: "Kiribati" },
    { code: "NR", dial: "+674", name: "Nauru" },
    { code: "TV", dial: "+688", name: "Tuvalu" },
    { code: "FM", dial: "+691", name: "Micronesia" },
    { code: "MH", dial: "+692", name: "Marshall Islands" },
    { code: "PW", dial: "+680", name: "Palau" },
    { code: "CK", dial: "+682", name: "Cook Islands" },
    { code: "NU", dial: "+683", name: "Niue" },
    { code: "TK", dial: "+690", name: "Tokelau" }
]

// Helper function to get flag component by country code
const getFlagComponent = (countryCode: string) => {
    const FlagComponent = (flags as any)[countryCode]
    return FlagComponent || null
}

export function PhoneVerification({ onClose }: PhoneVerificationProps) {
    const [selectedCountry, setSelectedCountry] = useState<Country>(countries[1]) // Default to US
    const [phoneNumber, setPhoneNumber] = useState('')
    const [verificationCode, setVerificationCode] = useState('')
    const [step, setStep] = useState<'phone' | 'code' | 'success'>('phone')
    const [isLoading, setIsLoading] = useState(false)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setPhoneNumber(value)
    }

    const formatPhoneNumberDisplay = () => {

        try {
            const phone = parsePhoneNumberFromString(phoneNumber, selectedCountry.code as CountryCode);
            if (phone && phone.isValid()) {
                return phone.format("E.164");  // strict international format
            }
            return null;
        } catch {
            return null;

        }
    }

    const _isPhoneNumberValid = () => {
        if (!phoneNumber) return false

        try {
            const fullNumber = `${selectedCountry.dial}${phoneNumber}`
            return isValidPhoneNumber(fullNumber)
        } catch {
            return false
        }
    }


    const handleSendCode = async () => {
        if (!phoneNumber) return

        setIsLoading(true)

        try {
            const formattedNumber = formatPhoneNumberDisplay()

            if (!formattedNumber) {
                toast.error('Please enter a valid phone number', {
                    style: {
                        background: '#f44336',
                        color: '#fff',
                        fontSize: '14px',
                    }
                })
                return
            }

            // Send SMS verification code
            const response = await fetch('/api/sms/send-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phoneNumber: formattedNumber,
                    countryCode: selectedCountry.code
                })
            })

            const data = await response.json()

            if (data.success) {
                console.log('Verification code sent successfully')
                setStep('code')
            } else {
                toast.error(data.error || 'Failed to send verification code', {
                    style: {
                        background: '#f44336',
                        color: '#fff',
                        fontSize: '14px',
                    }
                })
            }

        } catch (error) {
            console.error('Failed to send verification code:', error)
            toast.error('Failed to send verification code. Please try again.', {
                style: {
                    background: '#f44336',
                    color: '#fff',
                    fontSize: '14px',
                }
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerifyCode = async () => {
        if (!verificationCode) return

        setIsLoading(true)

        try {
            const formattedNumber = formatPhoneNumberDisplay()

            if (!formattedNumber) {
                alert('Phone number error')
                return
            }

            // Verify SMS code
            const response = await fetch('/api/sms/verify-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phoneNumber: formattedNumber,
                    code: verificationCode
                })
            })

            const data = await response.json()

            if (data.success) {
                toast.success('Phone verified successfully', {
                    style: {
                        background: '#4caf50',
                        color: '#fff',
                        fontSize: '14px',
                    }
                })
                setStep('success')
            } else {
                toast.error(data.error || 'Invalid verification code', {
                    style: {
                        background: '#f44336',
                        color: '#fff',
                        fontSize: '14px',
                    }
                })
            }

        } catch (error) {
            console.error('Failed to verify code:', error)
            toast.error('Failed to verify code. Please try again.', {
                style: {
                    background: '#f44336',
                    color: '#fff',
                    fontSize: '14px',
                }
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleResendCode = async () => {
        handleSendCode()
    }

    if (step === 'success') {
        return (
            <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Phone Verified!</h3>
                <p className="text-gray-600 mb-6">
                    Your phone number has been successfully verified.
                </p>
                <Button onClick={onClose}>
                    Close
                </Button>
            </div>
        )
    }

    if (step === 'code') {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                        <Phone className="w-8 h-8 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Check Your Phone</h3>
                    <p className="text-gray-600">
                        We&apos;ve sent a 6-digit verification code to <strong>{formatPhoneNumberDisplay()}</strong>
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Verification Code
                        </label>
                        <Input
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            maxLength={6}
                            className="text-center text-lg tracking-widest"
                        />
                    </div>

                    <div className="flex space-x-3">
                        <Button
                            onClick={handleVerifyCode}
                            disabled={!verificationCode || verificationCode.length !== 6 || isLoading}
                            className="flex-1"
                        >
                            {isLoading ? (
                                <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4 animate-spin" />
                                    <span>Verifying...</span>
                                </div>
                            ) : (
                                'Verify Code'
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleResendCode}
                            disabled={isLoading}
                        >
                            Resend
                        </Button>
                    </div>

                    <div className="text-center">
                        <button
                            onClick={() => setStep('phone')}
                            className="text-sm text-teal-600 hover:text-teal-700"
                        >
                            Use a different phone number
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                    <Phone className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Verify Your Phone</h3>
                <p className="text-gray-600">
                    Enter your phone number to receive a verification code via SMS
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                    </label>
                    <div className="flex space-x-2">
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white min-w-[120px] justify-between"
                            >
                                <div className="flex items-center space-x-2">
                                    {getFlagComponent(selectedCountry.code) && (
                                        React.createElement(getFlagComponent(selectedCountry.code), {
                                            className: "w-4 h-3"
                                        })
                                    )}
                                    <span className="text-sm font-medium">{selectedCountry.dial}</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                                    {countries.map((country) => (
                                        <button
                                            key={country.code}
                                            type="button"
                                            onClick={() => {
                                                setSelectedCountry(country)
                                                setIsDropdownOpen(false)
                                            }}
                                            className="w-full flex items-center justify-between space-x-3 px-4 py-2 hover:bg-gray-50 text-left"
                                        >
                                            {getFlagComponent(country.code) && (
                                                React.createElement(getFlagComponent(country.code), {
                                                    className: "w-5 h-4 rounded-full"
                                                })
                                            )}
                                            {/* <span className="text-sm text-gray-600">{country.code}</span> */}
                                            <p className="text-sm font-medium text-right">{country.dial}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <Input
                            type="tel"
                            placeholder="(555) 123-4567"
                            value={phoneNumber}
                            onChange={handlePhoneChange}
                            className="flex-1"
                        />
                    </div>
                </div>

                <div className="flex space-x-3">
                    <Button
                        onClick={handleSendCode}
                        disabled={!phoneNumber || !formatPhoneNumberDisplay() || isLoading}
                        className="flex-1"
                    >
                        {isLoading ? (
                            <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 animate-spin" />
                                <span>Sending...</span>
                            </div>
                        ) : (
                            'Send Verification Code'
                        )}
                    </Button>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-teal-900 mb-2">Why verify your phone?</h4>
                <ul className="text-sm text-teal-700 space-y-1">
                    <li>• Receive SMS notifications for urgent updates</li>
                    <li>• Enable two-factor authentication for security</li>
                    <li>• Allow direct contact for package coordination</li>
                    <li>• Required for some premium features</li>
                </ul>
            </div>
        </div>
    )
}
