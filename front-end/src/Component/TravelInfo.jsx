import React, { useState, useEffect } from 'react';
import { Cloud, DollarSign, Globe, Phone, MapPin, AlertCircle, Info, Loader2 } from 'lucide-react';

const TravelInfo = ({ destination, country }) => {
  const [weather, setWeather] = useState(null);
  const [currency, setCurrency] = useState(null);
  const [timezone, setTimezone] = useState(null);
  const [visaInfo, setVisaInfo] = useState(null);
  const [emergencyContacts, setEmergencyContacts] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (country) {
      loadTravelInfo();
    }
  }, [country]);

  const loadTravelInfo = async () => {
    setLoading(true);
    try {
      // Get country code for API calls
      const countryCode = await getCountryCode(country);
      
      // Try to load real weather data (if OpenWeatherMap API key is available)
      // For now, we'll use a placeholder but structure it for real API integration
      try {
        // TODO: Add OpenWeatherMap API integration when API key is available
        // const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${country}&appid=${API_KEY}`);
        // const weatherData = await weatherRes.json();
        // setWeather({
        //   temperature: `${Math.round(weatherData.main.temp - 273.15)}°C`,
        //   condition: weatherData.weather[0].main,
        //   humidity: `${weatherData.main.humidity}%`,
        //   wind: `${weatherData.wind.speed} m/s`
        // });
        
        // Placeholder for now - will be replaced with real API
        setWeather({
          temperature: 'Loading...',
          condition: 'Loading...',
          humidity: 'Loading...',
          wind: 'Loading...'
        });
      } catch (e) {
        console.error('Weather API error:', e);
        // Don't show weather if API fails
        setWeather(null);
      }

      // Load currency info
      try {
        const currencyRes = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fields=currencies`);
        const currencyData = await currencyRes.json();
        if (currencyData && currencyData[0] && currencyData[0].currencies) {
          const currencyKey = Object.keys(currencyData[0].currencies)[0];
          const currencyInfo = currencyData[0].currencies[currencyKey];
          setCurrency({
            code: currencyKey,
            name: currencyInfo.name,
            symbol: currencyInfo.symbol
          });
        }
      } catch (e) {
        console.error('Currency fetch error:', e);
      }

      // Load timezone
      try {
        const tzRes = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fields=timezones`);
        const tzData = await tzRes.json();
        if (tzData && tzData[0] && tzData[0].timezones) {
          setTimezone(tzData[0].timezones[0]);
        }
      } catch (e) {
        console.error('Timezone fetch error:', e);
      }

      // Load emergency contacts from country data
      try {
        const emergencyRes = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fields=name`);
        const emergencyData = await emergencyRes.json();
        if (emergencyData && emergencyData[0]) {
          // Use country-specific emergency numbers (these vary by country)
          // For now, show generic message with link to embassy
          setEmergencyContacts({
            police: 'Check local directory',
            ambulance: 'Check local directory',
            fire: 'Check local directory',
            embassy: 'Contact your embassy for assistance'
          });
        }
      } catch (e) {
        console.error('Emergency contacts error:', e);
        setEmergencyContacts({
          police: 'Check local directory',
          ambulance: 'Check local directory',
          fire: 'Check local directory',
          embassy: 'Contact your embassy'
        });
      }

      // Visa info - show message to check with embassy (real data would require visa API)
      setVisaInfo({
        required: 'Please check visa requirements with your local embassy',
        processingTime: 'Varies by country and visa type',
        cost: 'Varies by country and visa type'
      });

    } catch (error) {
      console.error('Failed to load travel info:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCountryCode = async (countryName) => {
    try {
      const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fields=cca2`);
      const data = await res.json();
      return data[0]?.cca2 || null;
    } catch {
      return null;
    }
  };

  const convertCurrency = async (amount, from = 'USD', to) => {
    if (!to || !currency) return null;
    try {
      // In production, use actual currency conversion API
      // For now, return placeholder
      return { converted: amount * 1.1, rate: 1.1 };
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin text-purple-600" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Info size={24} />
        Travel Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Weather */}
        {weather && (
          <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <Cloud className="text-blue-600" size={20} />
              <h3 className="font-semibold text-gray-900">Weather</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Temperature:</span>
                <span className="font-semibold text-gray-900">{weather.temperature}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Condition:</span>
                <span className="font-semibold text-gray-900">{weather.condition}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Humidity:</span>
                <span className="font-semibold text-gray-900">{weather.humidity}</span>
              </div>
            </div>
          </div>
        )}

        {/* Currency */}
        {currency && (
          <div className="border rounded-lg p-4 bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="text-green-600" size={20} />
              <h3 className="font-semibold text-gray-900">Currency</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Currency:</span>
                <span className="font-semibold text-gray-900">{currency.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Code:</span>
                <span className="font-semibold text-gray-900">{currency.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Symbol:</span>
                <span className="font-semibold text-gray-900">{currency.symbol}</span>
              </div>
            </div>
          </div>
        )}

        {/* Timezone */}
        {timezone && (
          <div className="border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="text-purple-600" size={20} />
              <h3 className="font-semibold text-gray-900">Timezone</h3>
            </div>
            <div className="text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Current Time:</span>
                <span className="font-semibold text-gray-900">
                  {(() => {
                    try {
                      // Check if timezone is in offset format (UTC+XX:XX or UTC-XX:XX)
                      if (timezone.startsWith('UTC')) {
                        // Extract offset from UTC+02:00 format
                        const offsetMatch = timezone.match(/UTC([+-])(\d{1,2}):?(\d{2})?/);
                        if (offsetMatch) {
                          const sign = offsetMatch[1] === '+' ? 1 : -1;
                          const hours = parseInt(offsetMatch[2] || '0', 10);
                          const minutes = parseInt(offsetMatch[3] || '0', 10);
                          const offsetMs = sign * (hours * 60 + minutes) * 60 * 1000;
                          const localTime = new Date(Date.now() + offsetMs);
                          return localTime.toLocaleString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: true
                          });
                        }
                        // If parsing fails, just show the timezone string
                        return timezone;
                      } else {
                        // It's a proper IANA timezone, use it directly
                        return new Date().toLocaleString('en-US', { 
                          timeZone: timezone,
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: true
                        });
                      }
                    } catch (error) {
                      // If anything fails, just display the timezone string
                      console.error('Timezone formatting error:', error);
                      return timezone;
                    }
                  })()}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-500">{timezone}</div>
            </div>
          </div>
        )}

        {/* Visa Information */}
        {visaInfo && (
          <div className="border rounded-lg p-4 bg-gradient-to-br from-yellow-50 to-yellow-100">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="text-yellow-600" size={20} />
              <h3 className="font-semibold text-gray-900">Visa Information</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Required:</span>
                <span className="font-semibold text-gray-900 ml-2">{visaInfo.required}</span>
              </div>
              <div>
                <span className="text-gray-600">Processing:</span>
                <span className="font-semibold text-gray-900 ml-2">{visaInfo.processingTime}</span>
              </div>
              <div>
                <span className="text-gray-600">Cost:</span>
                <span className="font-semibold text-gray-900 ml-2">{visaInfo.cost}</span>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Contacts */}
        {emergencyContacts && (
          <div className="border rounded-lg p-4 bg-gradient-to-br from-red-50 to-red-100 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Phone className="text-red-600" size={20} />
              <h3 className="font-semibold text-gray-900">Emergency Contacts</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Police:</span>
                <span className="font-semibold text-gray-900">{emergencyContacts.police}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ambulance:</span>
                <span className="font-semibold text-gray-900">{emergencyContacts.ambulance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fire:</span>
                <span className="font-semibold text-gray-900">{emergencyContacts.fire}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Embassy:</span>
                <span className="font-semibold text-gray-900 text-xs">{emergencyContacts.embassy}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Travel information is provided for reference only. 
          Please verify visa requirements, currency rates, and emergency contacts before your trip.
        </p>
      </div>
    </div>
  );
};

export default TravelInfo;

