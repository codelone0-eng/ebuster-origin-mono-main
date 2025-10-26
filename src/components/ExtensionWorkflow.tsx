import { Download, LogIn, Code2, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

export const ExtensionWorkflow = () => {
  const steps = [
    {
      id: 1,
      icon: Download,
      title: 'Установите расширение',
      description: 'Скачайте Ebuster из Chrome Web Store',
      color: 'from-blue-500/20 to-blue-600/20',
      iconColor: 'text-blue-500',
      borderColor: 'border-blue-500/30',
    },
    {
      id: 2,
      icon: LogIn,
      title: 'Авторизуйтесь',
      description: 'Войдите через OAuth для синхронизации',
      color: 'from-purple-500/20 to-purple-600/20',
      iconColor: 'text-purple-500',
      borderColor: 'border-purple-500/30',
    },
    {
      id: 3,
      icon: Code2,
      title: 'Создайте скрипт',
      description: 'Напишите свой первый userscript',
      color: 'from-green-500/20 to-green-600/20',
      iconColor: 'text-green-500',
      borderColor: 'border-green-500/30',
    },
    {
      id: 4,
      icon: Zap,
      title: 'Запустите на сайте',
      description: 'Скрипт автоматически выполнится',
      color: 'from-orange-500/20 to-orange-600/20',
      iconColor: 'text-orange-500',
      borderColor: 'border-orange-500/30',
    },
    {
      id: 5,
      icon: CheckCircle2,
      title: 'Готово!',
      description: 'Наслаждайтесь автоматизацией',
      color: 'from-emerald-500/20 to-emerald-600/20',
      iconColor: 'text-emerald-500',
      borderColor: 'border-emerald-500/30',
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto py-12">
      {/* Desktop Flow */}
      <div className="hidden lg:block relative">
        {/* Connection Lines */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-border via-primary/30 to-border -translate-y-1/2 -z-10" />
        
        <div className="flex items-center justify-between gap-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Card */}
              <div className="relative group flex-1">
                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Card */}
                <div className={`relative bg-card/50 backdrop-blur-sm border-2 ${step.borderColor} rounded-2xl p-6 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl`}>
                  {/* Step Number */}
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                    {step.id}
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:rotate-6`}>
                    <step.icon className={`w-8 h-8 ${step.iconColor}`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-foreground mb-2 text-center">{step.title}</h3>
                  <p className="text-sm text-muted-foreground text-center">{step.description}</p>

                  {/* Pulse Animation */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-primary/0 group-hover:border-primary/50 transition-all duration-300 animate-pulse" />
                </div>
              </div>

              {/* Arrow */}
              {index < steps.length - 1 && (
                <div className="flex-shrink-0 mx-2">
                  <ArrowRight className="w-6 h-6 text-primary/50" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile/Tablet Flow */}
      <div className="lg:hidden space-y-6">
        {steps.map((step, index) => (
          <div key={step.id} className="relative">
            {/* Step Card */}
            <div className="relative group">
              {/* Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${step.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Card */}
              <div className={`relative bg-card/50 backdrop-blur-sm border-2 ${step.borderColor} rounded-2xl p-6 transition-all duration-300`}>
                <div className="flex items-start gap-4">
                  {/* Step Number & Icon */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center`}>
                        <step.icon className={`w-8 h-8 ${step.iconColor}`} />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                        {step.id}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow Down */}
            {index < steps.length - 1 && (
              <div className="flex justify-center my-4">
                <div className="w-0.5 h-8 bg-gradient-to-b from-primary/50 to-transparent" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Animated Background Dots */}
      <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/20 rounded-full animate-pulse" />
        <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-primary/20 rounded-full animate-pulse delay-75" />
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-primary/20 rounded-full animate-pulse delay-150" />
      </div>
    </div>
  );
};
