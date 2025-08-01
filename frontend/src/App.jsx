import React, { useState } from 'react';
import ResultsPage from './ResultsPage.jsx';

const API_BASE_URL = 'https://computrabajo.onrender.com';

const MIN_SEARCH_TERM_LENGTH = 3;
const MAX_DOTS_ALLOWED = 2;
const DISALLOWED_START_CHARS_REGEX = /[!@#$%^&*()_+={}\]|;:'",<>/?`~-]/;

function App() {
    const [searchTerm, setSearchTerm] = useState('');
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [inputError, setInputError] = useState('');
    const [downloadInfo, setDownloadInfo] = useState(null);
    const [showResultsPage, setShowResultsPage] = useState(false);
    const [totalResultsCount, setTotalResultsCount] = useState(0);

    const validateSearchTerm = (term) => {
        if (!term.trim()) {
            return 'El campo de búsqueda no puede estar vacío.';
        }
        if (DISALLOWED_START_CHARS_REGEX.test(term[0]) && term[0] !== '.') {
            return 'El término de búsqueda no puede empezar con la mayoría de los caracteres especiales. Los puntos son permitidos si el contexto lo requiere.';
        }
        if (term.length < MIN_SEARCH_TERM_LENGTH) {
            return `El término de búsqueda debe contener al menos ${MIN_SEARCH_TERM_LENGTH} letras.`;
        }
        const containsLetters = /[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/.test(term);
        const containsNumbers = /\d/.test(term);
        if (containsNumbers && !containsLetters) {
            return 'El término de búsqueda no puede contener solo números. Debe incluir texto.';
        }
        const dotCount = (term.match(/\./g) || []).length;
        if (dotCount > MAX_DOTS_ALLOWED) {
            return `El término de búsqueda no puede contener más de ${MAX_DOTS_ALLOWED} puntos (.).`;
        }
        if (dotCount > 0 && !containsLetters && containsNumbers) {
            return 'El término de búsqueda no puede contener solo números y puntos. Debe incluir texto.';
        }
        return '';
    };

    const handleSearch = async () => {
        const trimmedSearchTerm = searchTerm.trim();
        const validationMessage = validateSearchTerm(trimmedSearchTerm);

        if (validationMessage) {
            setErrorMessage(validationMessage);
            setOffers([]);
            setShowResultsPage(false);
            setTotalResultsCount(0);
            return;
        }

        setErrorMessage('');
        setInputError('');

        setLoading(true);
        setOffers([]);
        setDownloadInfo(null);
        setShowResultsPage(false);
        setTotalResultsCount(0);

        try {
            const response = await fetch(`${API_BASE_URL}/buscar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cargo: trimmedSearchTerm }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Error desconocido del servidor.' }));
                setOffers([]);
                setTotalResultsCount(0);
                throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.offers && Array.isArray(data.offers) && data.offers.length > 0) {
                setOffers(data.offers);
                setTotalResultsCount(data.totalResultsCount || data.offers.length);

                const busquedaFormatted = trimmedSearchTerm.replace(/\s+/g, '_').toLowerCase().replace(/[^a-z0-9_.-]/g, "");
                const datePart = new Date().toISOString().split('T')[0];
                const baseFileName = `ofertas_${busquedaFormatted}_${datePart}`;

                setDownloadInfo({ baseFileName, puesto: trimmedSearchTerm });
                setShowResultsPage(true);
            } else {
                setErrorMessage(`No se encontraron ofertas para "${trimmedSearchTerm}". Intenta con otro término.`);
                setOffers([]);
                setTotalResultsCount(0);
                setShowResultsPage(false);
            }
        } catch (error) {
            console.error('Error al obtener datos:', error);
            setErrorMessage(`¡Error! No se pudieron cargar las ofertas. Por favor, verifica que el backend esté funcionando y sea accesible en ${API_BASE_URL}.`);
            setOffers([]);
            setTotalResultsCount(0);
            setShowResultsPage(false);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSearch();
    };

    const handleSearchInputChange = (e) => {
        let value = e.target.value;
        value = value.trimStart();
        value = value.replace(/\s{2,}/g, ' ');

        setSearchTerm(value);
        setErrorMessage('');

        if (value.length > 0) {
            const firstChar = value[0];
            if (DISALLOWED_START_CHARS_REGEX.test(firstChar) && firstChar !== '.') {
                setInputError('No puede empezar con la mayoría de caracteres especiales.');
            } else if (value.length < MIN_SEARCH_TERM_LENGTH && value.length > 0) {
                setInputError(`Mínimo ${MIN_SEARCH_TERM_LENGTH} letras.`);
            } else if (/\d/.test(value) && !/[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/.test(value)) {
                setInputError('Debe incluir texto, no solo números.');
            } else if ((value.match(/\./g) || []).length > MAX_DOTS_ALLOWED) {
                setInputError(`Máximo ${MAX_DOTS_ALLOWED} puntos (.).`);
            } else {
                setInputError('');
            }
        } else {
            setInputError('');
        }
    };

    const LoadingSpinner = () => {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
                <p className="mt-4 text-indigo-600 text-xl font-semibold">Cargando ofertas, por favor espera...</p>
                <p className="text-gray-500 text-sm mt-2">Esto puede tomar un momento, el scraper está trabajando en segundo plano.</p>
            </div>
        );
    };

    if (showResultsPage) {
        return (
            <ResultsPage
                offers={offers}
                searchTerm={searchTerm}
                errorMessage={errorMessage}
                downloadInfo={downloadInfo}
                totalResultsCount={totalResultsCount}
                onBackToSearch={() => {
                    setShowResultsPage(false);
                    setOffers([]);
                    setSearchTerm('');
                    setErrorMessage('');
                    setInputError('');
                    setDownloadInfo(null);
                    setTotalResultsCount(0);
                }}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 via-indigo-50 font-sans text-gray-900">
            <header className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white py-20 px-4 shadow-lg relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-4 transition-all duration-300">
                        Buscador de Empleos
                    </h1>
                    <p className="text-xl opacity-90 mb-8 transition-all duration-300">
                        Encuentra tu próxima oportunidad laboral en Computrabajo.
                    </p>
                </div>
            </header>

            <div className="-mt-16 px-4 relative z-20 transition-all duration-500">
                <form onSubmit={handleSubmit} className="flex flex-row gap-4 max-w-2xl mx-auto w-full bg-white p-4 rounded-full shadow-2xl border border-indigo-200 transition-all duration-500 items-center">
                    <input
                        type="text"
                        className="flex-grow p-3 border-none rounded-full focus:outline-none text-lg text-gray-800 placeholder-gray-400 w-full"
                        placeholder="Ej: Marketing, Contabilidad, Ingeniería, Medicina..."
                        value={searchTerm}
                        onChange={handleSearchInputChange}
                        aria-label="Término de búsqueda de empleo"
                        aria-describedby={inputError ? "input-error-message" : undefined}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        className="bg-purple-600 text-white font-bold py-3 px-6 rounded-full shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 transition duration-300 transform hover:scale-105 w-auto whitespace-nowrap flex-shrink-0"
                        disabled={loading}
                    >
                        {loading ? 'Buscando...' : 'Buscar Empleos'}
                    </button>
                </form>
                {inputError && (
                    <p id="input-error-message" className="text-red-500 text-sm mt-2 text-center">
                        {inputError}
                    </p>
                )}
            </div>

            <main className="container mx-auto px-4 py-8">
                {loading && <LoadingSpinner />}
                {errorMessage && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg relative mt-8 shadow-md" role="alert">
                        <strong className="font-bold">¡Error!</strong>
                        <span className="block sm:inline ml-2">{errorMessage}</span>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
