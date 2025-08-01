import React, { useState, useEffect } from 'react';
import JobCard from './JobCard.jsx';
import Mapa from './mapa.jsx';
import { cityCoordinates } from './mapa.jsx';
import AboutUs from './AboutUs.jsx';

const ResultsPage = ({
    offers,
    searchTerm,
    onBackToSearch,
    errorMessage,
    totalResultsCount
}) => {
    const [selectedTab, setSelectedTab] = useState('all');
    const [userLocation, setUserLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [isLocating, setIsLocating] = useState(false);
    const [hasRequestedLocation, setHasRequestedLocation] = useState(false);

    useEffect(() => {
        if (offers.length === 0 && totalResultsCount === 0) {
            setSelectedTab('all');
        } else {
            setSelectedTab('all');
        }
        setUserLocation(null);
        setLocationError(null);
        setIsLocating(false);
        setHasRequestedLocation(false);
    }, [offers, searchTerm, totalResultsCount]);

    const parseSalario = (salarioStr) => {
        if (!salarioStr || typeof salarioStr !== 'string') {
            return 0;
        }
        const lowerCaseSalario = String(salarioStr).toLowerCase();
        if (lowerCaseSalario.includes('confidencial') || lowerCaseSalario.includes('a convenir')) {
            return 0;
        }
        const cleaned = lowerCaseSalario.replace(/[^0-9.,-]+/g, '');
        let numericValue = 0;
        if (cleaned.includes('-')) {
            const parts = cleaned.split('-').map(p => parseFloat(p.replace(/,/g, '')));
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                numericValue = (parts[0] + parts[1]) / 2;
            } else if (parts.length === 1 && !isNaN(parts[0])) {
                numericValue = parseFloat(parts[0]);
            }
        } else {
            numericValue = parseFloat(cleaned.replace(/,/g, ''));
        }
        return isNaN(numericValue) ? 0 : numericValue;
    };

    const offersWithParsedSalary = offers.map(offer => ({
        ...offer,
        numericSalary: parseSalario(offer.salario)
    }));

    const validSalaryOffers = offersWithParsedSalary.filter(offer => offer.numericSalary > 0);

    const displayLimit = validSalaryOffers.length < 20 ? Math.floor(validSalaryOffers.length / 2) : 10;

    const sortedOffersHighToLow = [...validSalaryOffers].sort((a, b) => b.numericSalary - a.numericSalary);

    const topSalaries = sortedOffersHighToLow.slice(0, displayLimit);

    const remainingOffersForLow = sortedOffersHighToLow.slice(displayLimit);

    const bottomSalaries = [...remainingOffersForLow].sort((a, b) => a.numericSalary - b.numericSalary).slice(0, displayLimit);

    const lowSalariesLessThan30 = bottomSalaries.filter(offer => offer.numericSalary < 30);

    const ErrorMessage = ({ message }) => {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg relative mt-8 shadow-md" role="alert">
                <strong className="font-bold">¡Error!</strong>
                <span className="block sm:inline ml-2">{message}</span>
            </div>
        );
    };

    const SimplifiedJobCard = ({ offer }) => {
        const cleanText = (text) => text ? String(text).replace(/\s+/g, ' ').trim() : 'No especificado';
        const ubicacionModalidad = `${cleanText(offer.ubicacion)}`;
        const displaySalario = offer.salario && !['confidencial', 'a convenir'].includes(String(offer.salario).toLowerCase())
            ? cleanText(offer.salario)
            : '';

        return (
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100 text-sm">
                <h4 className="font-semibold text-gray-900 mb-1">
                    <a href={offer.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {cleanText(offer.titulo)}
                    </a>
                </h4>
                <p className="text-gray-700 mb-0.5">{cleanText(offer.empresa)}</p>
                <p className="text-gray-500 mb-0.5">{ubicacionModalidad}</p>
                {displaySalario && <p className="text-green-600 font-medium">{displaySalario}</p>}
                {offer.fechaPublicacion && (
                    <p className="text-gray-500 text-xs mt-1">Publicado: {cleanText(offer.fechaPublicacion)}</p>
                )}
            </div>
        );
    };

    const requestUserLocation = () => {
        setIsLocating(true);
        setLocationError(null);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                    setLocationError(null);
                    setIsLocating(false);
                },
                (error) => {
                    console.error("Error al obtener la ubicación:", error);
                    let msg = "No se pudo obtener tu ubicación. Por favor, permite el acceso a la ubicación en la configuración de tu navegador.";
                    if (error.code === error.PERMISSION_DENIED) {
                        msg = "Permiso de ubicación denegado. Por favor, habilita el acceso a la ubicación en la configuración de tu navegador para ver ofertas cercanas.";
                    } else if (error.code === error.POSITION_UNAVAILABLE) {
                        msg = "Información de ubicación no disponible.";
                    } else if (error.code === error.TIMEOUT) {
                        msg = "La solicitud para obtener la ubicación ha caducado.";
                    }
                    setLocationError(msg);
                    setUserLocation(null);
                    setIsLocating(false);
                }
            );
        } else {
            setLocationError("Tu navegador no soporta la geolocalización.");
            setIsLocating(false);
        }
    };

    const stripAccents = (str) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    const cleanLocationForComparison = (location) => {
        if (!location) return '';
        let cleaned = String(location).toLowerCase().trim();
        cleaned = cleaned.replace(/,.*/, '').trim();
        cleaned = stripAccents(cleaned);
        return cleaned;
    };

    const offersForMap = offers.filter(offer => {
        if (!offer || typeof offer !== 'object' || !offer.ubicacion || typeof offer.ubicacion !== 'string') {
            return false;
        }

        const rawUbicacion = offer.ubicacion.toLowerCase().trim();

        const isRemote = rawUbicacion.includes('remoto') || rawUbicacion.includes('desde casa');
        if (isRemote) {
            return false;
        }

        const cleanedUbicacion = cleanLocationForComparison(rawUbicacion);

        if (!cityCoordinates || typeof cityCoordinates !== 'object') {
            console.error("cityCoordinates object is not available or is malformed.");
            return false;
        }

        return cityCoordinates.hasOwnProperty(cleanedUbicacion);
    });

    console.log(`Ofertas filtradas para el mapa (solo México, no remotas): ${offersForMap.length}`);

    const handleExport = async (format) => {
        try {
            // Updated URL for export functionality
            const response = await fetch(`https://computrabajo.onrender.com/export/${format}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ offers, searchTerm }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error en la exportación: ${response.status} ${errorText}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ofertas-${searchTerm}.${format}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error al exportar:', error);
            alert(`Error al exportar el archivo ${format.toUpperCase()}: ${error.message}. Consulta la consola para más detalles.`);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 via-indigo-50 font-sans text-gray-900 py-10">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-indigo-200">

                    <h2 className="text-4xl md:text-5xl font-extrabold text-indigo-800 mb-2 text-center leading-tight">
                        Resultados para "<span className="text-purple-700">{searchTerm}</span>"
                    </h2>
                    <p className="text-xl text-gray-700 text-center mb-6">
                        Total de resultados encontrados en Computrabajo: <span className="font-bold text-indigo-600">{totalResultsCount}</span>
                    </p>

                    <div className="flex justify-center mb-8">
                        <button
                            onClick={onBackToSearch}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-full shadow-lg transition duration-300 transform hover:scale-105 flex items-center space-x-2 w-3/4 max-w-xs md:w-auto mx-auto"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"></path></svg>
                            <span>Nueva Búsqueda</span>
                        </button>
                    </div>

                    {errorMessage && <ErrorMessage message={errorMessage} />}

                    {!errorMessage && (
                        <>
                            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 border-b-2 border-gray-200 pb-4 mb-8">
                                <button
                                    onClick={() => { setSelectedTab('all'); }}
                                    className={`flex-1 min-w-[120px] sm:flex-none py-3 px-3 sm:px-6 rounded-lg font-semibold text-sm sm:text-lg transition-all duration-300 ${
                                        selectedTab === 'all'
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-800'
                                    }`}
                                >
                                    Todas las Ofertas ({offers.length})
                                </button>
                                <button
                                    onClick={() => { setSelectedTab('topHigh'); }}
                                    className={`flex-1 min-w-[120px] sm:flex-none py-3 px-3 sm:px-6 rounded-lg font-semibold text-sm sm:text-lg transition-all duration-300 ${
                                        selectedTab === 'topHigh'
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-800'
                                    }`}
                                >
                                    Top Salarios Altos ({topSalaries.length})
                                </button>
                                <button
                                    onClick={() => { setSelectedTab('topLow'); }}
                                    className={`flex-1 min-w-[120px] sm:flex-none py-3 px-3 sm:px-6 rounded-lg font-semibold text-sm sm:text-lg transition-all duration-300 ${
                                        selectedTab === 'topLow'
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-800'
                                    }`}
                                >
                                    Top Salarios Bajos ({bottomSalaries.length})
                                </button>
                                <button
                                    onClick={() => { setSelectedTab('location'); }}
                                    className={`flex-1 min-w-[120px] sm:flex-none py-3 px-3 sm:px-6 rounded-lg font-semibold text-sm sm:text-lg transition-all duration-300 ${
                                        selectedTab === 'location'
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-800'
                                    }`}
                                >
                                    Ubicación
                                </button>
                                <button
                                    onClick={() => { setSelectedTab('about'); }}
                                    className={`flex-1 min-w-[120px] sm:flex-none py-3 px-3 sm:px-6 rounded-lg font-semibold text-sm sm:text-lg transition-all duration-300 ${
                                        selectedTab === 'about'
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'bg-gray-200 text-gray-700'
                                    }`}
                                >
                                    Sobre Nosotros
                                </button>
                            </div>

                            {selectedTab === 'all' && (
                                <>
                                    <div className="flex flex-wrap justify-end gap-2 mb-6">
                                        <button
                                            onClick={() => handleExport('json')}
                                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 transform hover:scale-105 text-sm flex-1 sm:flex-none"
                                        >
                                            Exportar JSON
                                        </button>
                                        <button
                                            onClick={() => handleExport('xlsx')}
                                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 transform hover:scale-105 text-sm flex-1 sm:flex-none"
                                        >
                                            Exportar XLSX
                                        </button>
                                        <button
                                            onClick={() => handleExport('csv')}
                                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 transform hover:scale-105 text-sm flex-1 sm:flex-none"
                                        >
                                            Exportar CSV
                                        </button>
                                        <button
                                            onClick={() => handleExport('pdf')}
                                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 transform hover:scale-105 text-sm flex-1 sm:flex-none"
                                        >
                                            Exportar PDF
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                                        {offers.map((offer) => (
                                            <JobCard key={offer.url || offer.titulo + Math.random()} offer={offer} />
                                        ))}
                                    </div>
                                </>
                            )}

                            {selectedTab === 'topHigh' && (
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-bold text-gray-800 text-center mb-4">Top {topSalaries.length} Salarios Más Altos</h3>
                                    {topSalaries.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                                            {topSalaries.map((offer) => (
                                                <SimplifiedJobCard key={offer.url || offer.titulo + Math.random() + '-top'} offer={offer} />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-gray-500 mt-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                                            No se encontraron ofertas con salario numérico alto para este ranking.
                                        </p>
                                    )}
                                </div>
                            )}

                            {selectedTab === 'topLow' && (
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-bold text-gray-800 text-center mb-4">Top {bottomSalaries.length} Salarios Bajos</h3>
                                    {bottomSalaries.length > 0 ? (
                                        <>
                                            {lowSalariesLessThan30.length === bottomSalaries.length && bottomSalaries.length > 0 ? (
                                                <p className="text-center text-gray-700 mt-4 p-4 bg-yellow-100 rounded-lg shadow-sm border border-yellow-300">
                                                    Todas las ofertas en este ranking tienen salarios muy bajos (menos de $30.00). Considera buscar ofertas con salarios más altos.
                                                </p>
                                            ) : null}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                                                {bottomSalaries.map((offer) => (
                                                    <SimplifiedJobCard key={offer.url || offer.titulo + Math.random() + '-bottom'} offer={offer} />
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-center text-gray-500 mt-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                                            No se encontraron ofertas con salario numérico bajo para este ranking.
                                        </p>
                                    )}
                                </div>
                            )}

                            {selectedTab === 'location' && (
                                <div className="mt-8 p-6 bg-white rounded-lg shadow-lg border border-indigo-100">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Ofertas Cercanas en el Mapa</h3>

                                    {!hasRequestedLocation && (
                                        <div className="text-center py-10">
                                            <p className="text-gray-600 text-xl mb-6">Haz clic para ver ofertas cercanas a tu ubicación.</p>
                                            <button
                                                onClick={() => { setHasRequestedLocation(true); requestUserLocation(); }}
                                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 transform hover:scale-105"
                                            >
                                                Ver Mapa
                                            </button>
                                        </div>
                                    )}

                                    {hasRequestedLocation && isLocating && !locationError && (
                                        <div className="text-center py-10">
                                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
                                            <p className="mt-4 text-blue-600 text-xl font-semibold">Obteniendo tu ubicación...</p>
                                        </div>
                                    )}

                                    {hasRequestedLocation && locationError && (
                                        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg relative mt-4 mb-4 shadow-md" role="alert">
                                            <strong className="font-bold">¡Error de Ubicación!</strong>
                                            <span className="block sm:inline ml-2">{locationError}</span>
                                            <button
                                                onClick={requestUserLocation}
                                                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
                                                disabled={isLocating}
                                            >
                                                {isLocating ? 'Intentando...' : 'Intentar de nuevo'}
                                            </button>
                                        </div>
                                    )}

                                    {hasRequestedLocation && userLocation && offersForMap.length > 0 && (
                                        <div className="w-full h-96 rounded-lg shadow-md overflow-hidden border border-gray-200">
                                            <Mapa userLocation={userLocation} offers={offersForMap} />
                                        </div>
                                    )}

                                    {hasRequestedLocation && !userLocation && !isLocating && !locationError && offersForMap.length === 0 && (
                                        <p className="text-center text-gray-600 text-xl mt-12 p-8 bg-white border border-blue-200 rounded-lg shadow-lg">
                                            No hay ofertas presenciales con ubicación reconocida en México para mostrar en el mapa.
                                        </p>
                                    )}
                                    {hasRequestedLocation && userLocation && offersForMap.length === 0 && (
                                        <p className="text-center text-gray-600 text-xl mt-12 p-8 bg-white border border-blue-200 rounded-lg shadow-lg">
                                            No se encontraron ofertas presenciales en México para mostrar en el mapa para tu búsqueda.
                                        </p>
                                    )}
                                </div>
                            )}

                            {selectedTab === 'about' && (
                                <AboutUs />
                            )}
                        </>
                    )}
                </div>
                <footer className="text-center text-gray-500 mt-8 py-4 border-t border-gray-200">
                    <p className="text-sm">Datos obtenidos para fines educativos.</p>
                </footer>
            </div>
        </div>
    );
};

export default ResultsPage;