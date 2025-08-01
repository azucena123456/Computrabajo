import React from 'react';

const JobCard = ({ offer, simplified = false }) => {
    const cleanText = (text) => text ? String(text).replace(/\s+/g, ' ').trim() : 'No especificado';
    const ubicacionModalidad = `${cleanText(offer.ubicacion)}`;
    
    const displaySalario = offer.salario && !['confidencial', 'a convenir'].includes(String(offer.salario).toLowerCase())
        ? cleanText(offer.salario)
        : '';

    if (simplified) {
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
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 flex flex-col h-full">
            <h3 className="text-xl font-bold text-indigo-700 mb-2 leading-tight">
                <a 
                    href={offer.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                    aria-label={`Ver detalles de la oferta: ${cleanText(offer.titulo)}`}
                >
                    {cleanText(offer.titulo)}
                </a>
            </h3>
            <p className="text-gray-800 text-lg mb-1 font-semibold">{cleanText(offer.empresa)}</p>
            <p className="text-gray-600 text-base mb-2">{ubicacionModalidad}</p>
            <p className="text-green-700 font-bold text-lg mb-3">{displaySalario}</p>
            
            <div className="flex flex-wrap gap-2 mb-3">
                {offer.etiquetas && offer.etiquetas.slice(0, 3).map((tag, index) => (
                    <span key={index} className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {cleanText(tag)}
                    </span>
                ))}
            </div>

            {offer.descripcion && (
                <p className="text-gray-800 text-sm mb-4 flex-grow line-clamp-4">
                    {cleanText(offer.descripcion)}
                </p>
            )}

            <div className="mt-auto pt-3 border-t border-gray-100">
                {offer.fechaPublicacion && (
                    <p className="text-gray-500 text-xs text-right">
                        Publicado: {cleanText(offer.fechaPublicacion)}
                    </p>
                )}
            </div>

            <div className="mt-4">
                <a 
                    href={offer.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200"
                >
                    Ver Oferta
                    <svg className="ml-2 -mr-0.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </a>
            </div>
        </div>
    );
};

export default JobCard;
