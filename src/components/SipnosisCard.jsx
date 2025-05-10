import React from "react";

export default function SipnosisCard({
    sinopsis,
}) {
    return (
        <section className="mb-2 mt-6">
            <p className="text-sm">
                {sinopsis || 'No especificada'}
            </p>
        </section>
    );
}