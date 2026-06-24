/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef } from "react";
import AnimateIn from "./AnimateIn";
import { useGsapParallaxScroll } from "@/hooks/useGsapParallaxScroll";
import { urlFor } from "../sanity/utils/imageUrlBuilder";
import type { SanityImageSource } from "@sanity/image-url";
import { PortableText, PortableTextBlock } from "@portabletext/react";
import { Link } from "../types/footerSettings";
import ButtonLink from "./ButtonLink";

interface BreakProps {
  id?: string;
  layout?: "full-bleed" | "split";
  subHeading?: string;
  heading?: string;
  body?: PortableTextBlock[];
  image?: SanityImageSource;
  button?: Link;
  backgroundColor?: "black" | "green" | "orange";
}

export default function Hero({
  id,
  layout = "full-bleed",
  subHeading,
  heading,
  body,
  image,
  button,
  backgroundColor,
}: BreakProps) {
  const resolvedBackgroundColor = backgroundColor ?? "black";
  const sectionRef = useRef<HTMLElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const scaleImageRef = useRef<HTMLImageElement>(null);

  useGsapParallaxScroll(imageWrapRef, sectionRef, {
    enabled: layout === "full-bleed" && Boolean(image),
  });
  useGsapParallaxScroll(scaleImageRef, sectionRef, {
    enabled: layout === "full-bleed" && Boolean(image),
  });

  return (
    <>
      {layout === "full-bleed" && (
        <section
          ref={sectionRef}
          id={id}
          className="break-section layout-1 relative scale-container"
        >
          {image && (
            <div
              ref={imageWrapRef}
              className="fill-space-image-wrap media-wrap scale-element"
            >
              <img
                ref={scaleImageRef}
                data-src={urlFor(image).url()}
                alt=""
                className="lazy full-bleed-image scale-element"
              />
              <div className="loading-overlay" />
            </div>
          )}

          <div className="break-content h-pad">
            <AnimateIn as="h6">{subHeading}</AnimateIn>

            {heading && (
              <AnimateIn as="h1" className="break-heading">
                {heading}
              </AnimateIn>
            )}

            {body && body.length > 0 && (
              <AnimateIn className="break-body body-medium">
                <PortableText value={body} />
              </AnimateIn>
            )}
          </div>
        </section>
      )}

      {layout === "split" && (
        <section
          id={id}
          className={`break-section layout-2 row-lg h-pad background-${resolvedBackgroundColor === "black" ? "black" : resolvedBackgroundColor === "green" ? "green" : "orange"}`}
        >
          <AnimateIn className="col-6-12_lg">
            <div className="break-content">
              <h6 className="desktop">{subHeading}</h6>

              {subHeading && <h6 className="mobile">{subHeading}</h6>}

              {heading && <h1>{heading}</h1>}

              {(body || button) && (
                <div>
                  {body && body.length > 0 && (
                    <div className="break-body">
                      <PortableText value={body} />
                    </div>
                  )}

                  {button && (
                    <ButtonLink link={button} fallbackColor="outline" />
                  )}
                </div>
              )}
            </div>
          </AnimateIn>

          {image && (
            <AnimateIn className="col-6-12_lg">
              <div className="break-image relative">
                <div className="fill-space-image-wrap media-wrap">
                  <img
                    data-src={urlFor(image).url()}
                    alt=""
                    className="lazy full-bleed-image"
                  />
                  <div className="loading-overlay" />
                </div>
              </div>
            </AnimateIn>
          )}
        </section>
      )}
    </>
  );
}
