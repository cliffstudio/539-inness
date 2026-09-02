/* eslint-disable @next/next/no-img-element */
"use client";

import type { SanityImageSource } from "@sanity/image-url";
import AnimateIn from "./AnimateIn";
import { urlForHero } from "../sanity/utils/imageUrlBuilder";
import { PortableText, PortableTextBlock } from "@portabletext/react";
import SplideCarousel from "./SplideCarousel";
import { openRoomBooking } from "../utils/booking";

interface Spec {
  body?: string;
}

interface HeroProps {
  id?: string;
  title?: string;
  images?: SanityImageSource[];
  description?: PortableTextBlock[];
  specs?: Spec[];
}

export default function Hero({
  id,
  title,
  images,
  description,
  specs,
}: HeroProps) {
  return (
    <section id={id} className="hero-section layout-2 h-pad">
      {images &&
        images.length > 0 &&
        (images.length === 1 ? (
          <AnimateIn className="hero-image relative">
            <div className="media-wrap">
              <img
                data-src={urlForHero(images[0])}
                alt=""
                className="lazy full-bleed-image"
              />
              <div className="loading-overlay" />
            </div>
          </AnimateIn>
        ) : (
          <AnimateIn className="hero-image relative">
            <SplideCarousel
              images={images.map((image) => ({
                url: urlForHero(image),
                alt: "",
              }))}
              onPrevious={() => {}}
              onNext={() => {}}
            />
          </AnimateIn>
        ))}

      <AnimateIn className="hero-content">
        {(title || description) && (
          <div className="row-1">
            {title && <h3>{title}</h3>}

            {description && description.length > 0 && (
              <div className="hero-body">
                <PortableText value={description} />
              </div>
            )}
          </div>
        )}

        <div className="row-2">
          {specs && specs.length > 0 && (
            <div className="hero-specs">
              {specs.map((spec, index) => (
                <div key={index} className="spec-item">
                  {spec.body}
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            className="button button--orange link--alias"
            onClick={() => openRoomBooking()}
          >
            Book
          </button>
        </div>
      </AnimateIn>
    </section>
  );
}
