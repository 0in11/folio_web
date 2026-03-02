import { Github, Mail, MessageCircle } from "lucide-react";

const contactLinks = [
  {
    label: "Email",
    href: "mailto:your-email@example.com",
    icon: Mail,
    value: "your-email@example.com",
  },
  {
    label: "GitHub",
    href: "https://github.com/yourusername",
    icon: Github,
    value: "github.com/yourusername",
  },
  {
    label: "Threads",
    href: "https://threads.net/@yourhandle",
    icon: MessageCircle,
    value: "@yourhandle",
  },
];

export default function ContactSection() {
  return (
    <section id="contact" className="py-section px-6" aria-labelledby="contact-heading">
      <div className="max-w-content mx-auto">
        <div className="max-w-2xl">
          <p className="font-mono text-xs text-accent-primary tracking-widest uppercase mb-3">
            Contact
          </p>
          <h2
            id="contact-heading"
            className="font-display text-4xl md:text-5xl font-bold text-text-primary mb-4"
          >
            함께 만들고 싶은
            <br />
            AI 시스템이 있다면
          </h2>
          <p className="text-text-secondary mb-10">협업 제안이나 문의는 아래로 연락 주세요.</p>

          <div className="space-y-3">
            {contactLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={
                    link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"
                  }
                  aria-label={link.label}
                  className="flex items-center gap-4 p-4 rounded-card border border-border-subtle bg-bg-surface hover:border-border-strong hover:bg-bg-hover transition-all duration-200 group"
                >
                  <Icon
                    size={18}
                    className="text-text-muted group-hover:text-accent-primary transition-colors"
                  />
                  <span className="font-mono text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                    {link.value}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
