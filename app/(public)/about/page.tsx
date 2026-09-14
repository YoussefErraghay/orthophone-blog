import type { Metadata } from "next";
import { ViewTransition } from "react";
import {
  Baby,
  Brain,
  Clock3,
  GraduationCap,
  HeartHandshake,
  HeartPulse,
  Mail,
  MapPin,
  MessageCircleHeart,
  Phone,
  Stethoscope,
} from "lucide-react";
import { FaqAccordion } from "@/components/FaqAccordion";
import { HoverLift, Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Présentation du cabinet, du parcours de l'orthophoniste, des spécialités et des questions fréquentes.",
};

const SPECIALTIES = [
  {
    icon: MessageCircleHeart,
    title: "Retard de langage",
    body: "Évaluation et rééducation du langage oral, du vocabulaire à la construction de phrases.",
  },
  {
    icon: HeartPulse,
    title: "Oralité alimentaire",
    body: "Accompagnement des refus sélectifs, des textures et de la sensorialité orale.",
  },
  {
    icon: Baby,
    title: "Néonatologie",
    body: "Succion, déglutition et soutien à l'allaitement chez le nouveau-né prématuré.",
  },
  {
    icon: Brain,
    title: "Troubles d'apprentissage",
    body: "Lecture, orthographe et logico-mathématiques chez l'enfant scolarisé.",
  },
  {
    icon: HeartHandshake,
    title: "Guidance parentale",
    body: "Outils concrets pour prolonger le travail du cabinet à la maison.",
  },
  {
    icon: Stethoscope,
    title: "Bilans complets",
    body: "Bilan initial, compte rendu détaillé et projet thérapeutique individualisé.",
  },
];

const TIMELINE = [
  {
    year: "Formation",
    title: "Certificat de Capacité d'Orthophoniste",
    body: "Cinq années d'études cliniques et de stages en cabinet et en milieu hospitalier.",
  },
  {
    year: "Spécialisation",
    title: "Oralité & néonatologie",
    body: "Formations continues dédiées aux troubles de l'oralité et à la prise en charge du prématuré.",
  },
  {
    year: "Aujourd'hui",
    title: "Cabinet & ressources",
    body: "Consultations sur rendez-vous, et publication de guides gratuits pour les familles.",
  },
];

const FAQ = [
  {
    question: "À partir de quel âge consulter un orthophoniste ?",
    answer:
      "Il n'y a pas d'âge minimum. Un avis peut être utile dès les premiers mois en cas de difficultés de succion ou d'alimentation, et dès 18–24 mois si le langage tarde à se mettre en place.",
  },
  {
    question: "Faut-il une ordonnance médicale ?",
    answer:
      "Une prescription médicale est nécessaire pour le remboursement du bilan et des séances. Elle est établie par le médecin traitant ou le pédiatre.",
  },
  {
    question: "Combien de temps dure une prise en charge ?",
    answer:
      "Cela dépend entièrement du trouble et de l'enfant. Le bilan initial permet de proposer un nombre de séances, réévalué régulièrement.",
  },
  {
    question: "Les articles de ce site remplacent-ils un bilan ?",
    answer:
      "Non. Ils ont une visée informative et ne constituent ni un diagnostic ni une prescription. En cas de doute, prenez rendez-vous.",
  },
];

export default function AboutPage() {
  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      default="none"
    >
      <div className="container-page py-12">
        {/* ---------- Intro ---------- */}
        <section className="glass mb-16 overflow-hidden rounded-[2rem] p-8 sm:p-12">
          <div className="mx-auto max-w-2xl text-center">
            <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600 to-cyan-500 text-white shadow-lg shadow-sky-600/30">
              <Stethoscope className="h-7 w-7" aria-hidden />
            </span>

            <h1 className="text-3xl font-semibold tracking-tight text-[--c-text] sm:text-4xl">
              À propos du cabinet
            </h1>

            <p className="mt-5 text-lg text-[--c-text-soft]">
              Orthophoniste diplômée d&apos;État, j&apos;accompagne enfants et
              adultes dans les troubles du langage, de la communication et de
              l&apos;oralité.
            </p>
            <p className="mt-3 text-[--c-text-soft]">
              Ce site rassemble des articles et des brochures librement
              consultables, pour prolonger le travail entre les séances.
            </p>
          </div>
        </section>

        {/* ---------- Timeline ---------- */}
        <section className="mb-16">
          <Reveal className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-[--c-text]">
              Parcours
            </h2>
          </Reveal>

          <ol className="relative space-y-6 border-l-2 border-[--c-border] pl-6">
            {TIMELINE.map((step, index) => (
              <Reveal key={step.title} delay={index * 0.1}>
                <li className="relative">
                  <span
                    aria-hidden
                    className="absolute -left-[1.9rem] top-1.5 h-3.5 w-3.5 rounded-full bg-gradient-to-br from-sky-600 to-cyan-500 ring-4 ring-[--c-bg]"
                  />
                  <p className="text-xs font-medium uppercase tracking-wide text-[--c-accent]">
                    {step.year}
                  </p>
                  <h3 className="mt-1 font-semibold text-[--c-text]">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm text-[--c-text-soft]">
                    {step.body}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </section>

        {/* ---------- Specialties ---------- */}
        <section className="mb-16">
          <Reveal className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-[--c-text]">
              Domaines de prise en charge
            </h2>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SPECIALTIES.map(({ icon: Icon, title, body }, index) => (
              <Reveal key={title} delay={index * 0.06} className="h-full">
                <HoverLift className="h-full">
                  <div className="group h-full rounded-3xl border border-[--c-border] bg-[--c-surface] p-6 transition-shadow duration-300 hover:shadow-xl hover:shadow-sky-600/10">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/15 to-cyan-500/15 transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-5 w-5 text-[--c-accent]" aria-hidden />
                    </span>
                    <h3 className="mt-4 font-semibold text-[--c-text]">
                      {title}
                    </h3>
                    <p className="mt-1.5 text-sm text-[--c-text-soft]">
                      {body}
                    </p>
                  </div>
                </HoverLift>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <section className="mb-16">
          <Reveal className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-[--c-text]">
              Questions fréquentes
            </h2>
          </Reveal>

          <Reveal>
            <FaqAccordion items={FAQ} />
          </Reveal>
        </section>

        {/* ---------- Contact ---------- */}
        <section>
          <Reveal>
            <div className="glass overflow-hidden rounded-[2rem] p-8 sm:p-10">
              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-[--c-text]">
                    Prendre rendez-vous
                  </h2>
                  <p className="mt-3 text-sm text-[--c-text-soft]">
                    Un doute sur le développement de votre enfant ?
                    N&apos;attendez pas : un bilan précoce permet souvent une
                    prise en charge plus courte et plus efficace.
                  </p>

                  <dl className="mt-6 space-y-3 text-sm">
                    {[
                      { icon: MapPin, label: "Adresse du cabinet à compléter" },
                      { icon: Phone, label: "Numéro de téléphone à compléter" },
                      { icon: Mail, label: "Adresse e-mail à compléter" },
                      { icon: Clock3, label: "Horaires à compléter" },
                    ].map(({ icon: Icon, label }) => (
                      <div key={label} className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[--c-muted]">
                          <Icon
                            className="h-4 w-4 text-[--c-accent]"
                            aria-hidden
                          />
                        </span>
                        <dd className="text-[--c-text-soft]">{label}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="rounded-2xl border border-dashed border-[--c-border] p-6 text-center">
                  <GraduationCap
                    className="mx-auto mb-3 h-8 w-8 text-[--c-text-faint]"
                    aria-hidden
                  />
                  <p className="text-sm text-[--c-text-faint]">
                    Emplacement réservé à une carte ou à un formulaire de
                    contact, à brancher sur l&apos;outil de votre choix.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </div>
    </ViewTransition>
  );
}
