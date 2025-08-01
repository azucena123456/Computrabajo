import React from 'react';
import { FaLinkedin, FaGithub, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const teamMembers = [
    {
        name: 'Azucena Hernández Bautista',
        role: 'Ingeniera en Desarrollo y Gestión de Software',
        subRole: 'Desarrolladora Front-end',
        imageSrc: '/azucena_profile.png', 
        linkedinUrl: 'https://www.linkedin.com/in/azucena-hernández-a990a22b8',
        githubUrl: 'https://github.com/azucena123456',
        matricula: '2022057@utsh.edu.mx',
        telefono: '7711218965',
        ubicacion: 'Zacualtipán, Hidalgo, México',
    },
    {
        name: 'Patricia Martínez Hernández',
        role: 'Ingeniera en Desarrollo y Gestión de Software',
        subRole: 'Desarrolladora Back-end',
        imageSrc: '/patricia_profile.png', 
        linkedinUrl: 'https://www.linkedin.com/in/patricia-martinez-hernandez-232229377',
        githubUrl: 'https://www.github.com/Paty-MH', 
        matricula: '2022027@utsh.edu.mx',
        telefono: '7711597167',
        ubicacion: 'Zacualtipán, Hidalgo, México',
    },
];

const AboutUs = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
                {teamMembers.map((member, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl flex flex-col items-center p-6"
                    >
                        <div className="relative w-full h-32 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-t-xl mb-16 flex items-center justify-center">
                            <img
                                src={member.imageSrc}
                                alt={member.name}
                                className="absolute -bottom-16 w-36 h-36 rounded-full shadow-lg border-4 border-white object-cover transform transition-transform duration-300 hover:scale-110"
                            />
                        </div>
                        <div className="mt-8 text-center flex-grow">
                            <h4 className="font-bold text-2xl text-gray-800 mb-1">{member.name}</h4>
                            <p className="text-gray-600 text-base mb-2">{member.role}</p>
                            <p className="text-indigo-700 font-semibold text-lg mb-4 bg-indigo-50 px-3 py-1 rounded-full inline-block">
                                {member.subRole}
                            </p>
                            <div className="space-y-2 text-gray-500 text-sm mb-6 mt-4">
                                <p className="flex items-center justify-center">
                                    <FaEnvelope className="mr-2 text-indigo-500" />
                                    <span>{member.matricula}</span>
                                </p>
                                <p className="flex items-center justify-center">
                                    <FaPhone className="mr-2 text-indigo-500" />
                                    <span>{member.telefono}</span>
                                </p>
                                <p className="flex items-center justify-center">
                                    <FaMapMarkerAlt className="mr-2 text-indigo-500" />
                                    <span>{member.ubicacion}</span>
                                </p>
                            </div>
                            <div className="flex justify-center space-x-6 pt-4 border-t border-gray-100">
                                {member.linkedinUrl && (
                                    <a
                                        href={member.linkedinUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200 transform hover:scale-125"
                                    >
                                        <FaLinkedin className="w-8 h-8" />
                                    </a>
                                )}
                                {member.githubUrl && (
                                    <a
                                        href={member.githubUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-700 hover:text-gray-900 transition-colors duration-200 transform hover:scale-125"
                                    >
                                        <FaGithub className="w-8 h-8" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AboutUs;